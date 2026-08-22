from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

import requests

from app.config import settings
from app.schemas import FraudAnalyzeResponse, FraudAnalysisType, FraudIndicator

URL_PATTERN = re.compile(
    r"https?://[^\s<>\"']+|(?:[a-z0-9-]+\.)+(?:com|net|org|kr|co\.kr|xyz|top|site|link|click|shop)(?:/[^\s]*)?",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class Rule:
    code: str
    category: str
    pattern: re.Pattern[str]
    weight: float
    evidence: str


def rule(code: str, category: str, pattern: str, weight: float, evidence: str) -> Rule:
    return Rule(code, category, re.compile(pattern, re.IGNORECASE), weight, evidence)


COMMON_RULES = [
    rule("URGENCY", "심리 압박", r"지금|즉시|당장|오늘\s*안|몇\s*분|긴급|시간이\s*없", 0.10, "즉시 행동을 요구하는 긴급 표현이 있습니다."),
    rule("SECRECY", "고립 유도", r"아무에게도|가족.{0,8}말하지|비밀|전화.{0,5}끊지", 0.18, "가족이나 주변 사람에게 알리지 말라는 표현이 있습니다."),
    rule("CREDENTIAL", "민감정보 요구", r"주민등록번호|인증번호|OTP|비밀번호|보안카드|카드번호", 0.22, "인증정보 또는 민감정보를 요구하는 표현이 있습니다."),
    rule("REMOTE_APP", "원격제어 유도", r"원격.{0,8}(앱|프로그램)|팀뷰어|퀵서포트|애니데스크|anydesk|apk.{0,8}설치|앱.{0,8}설치", 0.28, "원격제어 또는 별도 앱 설치를 유도하는 표현이 있습니다."),
    rule("TRANSFER", "금전 요구", r"송금|이체|입금|계좌.{0,6}보내|현금.{0,8}(전달|찾아)", 0.24, "송금·이체·현금 전달을 요구하는 표현이 있습니다."),
]

VOICE_RULES = [
    rule("AUTHORITY", "기관 사칭", r"검찰|검사|경찰|금융감독원|금감원|국세청|법원|수사관", 0.16, "수사기관·공공기관을 사칭할 수 있는 표현이 있습니다."),
    rule("SAFE_ACCOUNT", "안전계좌", r"안전계좌|보호계좌|국가.{0,4}안전.{0,4}계좌", 0.38, "공공기관이 안내하지 않는 이른바 안전계좌 표현이 있습니다."),
    rule("LOAN_SWITCH", "대출 사칭", r"저금리.{0,8}대출|대환.{0,8}대출|기존.{0,8}대출.{0,8}상환|신용.{0,8}등급.{0,8}올", 0.18, "대출 갈아타기나 신용등급을 이유로 금전을 요구할 수 있는 표현이 있습니다."),
]

SMISHING_RULES = [
    rule("DELIVERY_LURE", "생활형 미끼", r"택배|배송|주소.{0,5}확인|과태료|범칙금|청첩장|부고|건강검진|교통위반", 0.10, "택배·과태료·경조사 등 클릭을 유도하는 소재가 있습니다."),
    rule("APP_INSTALL", "악성앱 설치 유도", r"\.apk|apk.{0,6}(다운|설치)|출처.{0,8}앱|보안.{0,8}업데이트.{0,8}설치", 0.30, "APK 또는 외부 앱 설치를 유도하는 표현이 있습니다."),
    rule("PAYMENT_LURE", "결제 유도", r"미납|결제.{0,5}취소|소액결제|환불.{0,6}링크|요금.{0,5}납부", 0.13, "미납·결제·환불을 이유로 링크 확인을 유도합니다."),
]

FINANCIAL_RULES = [
    rule("GUARANTEED_RETURN", "투자 사기", r"원금.{0,4}보장|수익.{0,4}보장|확정.{0,4}수익|월\s*\d+%|고수익.{0,8}보장", 0.30, "원금이나 높은 수익을 보장한다는 표현이 있습니다."),
    rule("UPFRONT_FEE", "선입금 요구", r"선입금|수수료.{0,6}먼저|보증금.{0,6}입금|공탁금|해제.{0,6}비용", 0.26, "대출·환급·거래 전에 비용을 먼저 보내라고 요구합니다."),
    rule("PRIVATE_ACCOUNT", "개인계좌 유도", r"개인.{0,4}계좌|담당자.{0,4}계좌|법인.{0,4}아닌.{0,4}계좌", 0.20, "개인 또는 담당자 명의 계좌로 송금을 유도합니다."),
    rule("CRYPTO", "가상자산 유도", r"코인|가상자산|USDT|테더|지갑주소|거래소.{0,8}전송", 0.12, "가상자산 전송을 요구하는 표현이 있습니다."),
    rule("INVEST_CHAT", "리딩방", r"리딩방|VIP방|급등주|상한가.{0,6}예정|내부정보|세력.{0,6}정보", 0.18, "투자 리딩방 또는 비공개 투자정보를 내세우는 표현이 있습니다."),
]


class FraudAnalyzer:
    def analyze(self, analysis_type: FraudAnalysisType, text: str) -> FraudAnalyzeResponse:
        normalized = " ".join(text.split())
        indicators: list[FraudIndicator] = []
        seen: set[str] = set()

        rules = list(COMMON_RULES)
        if analysis_type == "VOICE_PHISHING":
            rules.extend(VOICE_RULES)
        elif analysis_type == "SMISHING":
            rules.extend(SMISHING_RULES)
        else:
            rules.extend(FINANCIAL_RULES)

        for item in rules:
            if item.pattern.search(normalized) and item.code not in seen:
                seen.add(item.code)
                indicators.append(FraudIndicator(
                    code=item.code,
                    category=item.category,
                    evidence=item.evidence,
                    weight=item.weight,
                ))

        urls = self._extract_urls(normalized)
        if analysis_type == "SMISHING" and urls:
            indicators.append(FraudIndicator(
                code="URL_PRESENT",
                category="링크 포함",
                evidence="문자에 외부 링크가 포함되어 있습니다.",
                weight=0.08,
            ))
            seen.add("URL_PRESENT")
            if any(self._looks_shortened(url) for url in urls):
                indicators.append(FraudIndicator(
                    code="SHORT_URL",
                    category="축약 링크",
                    evidence="목적지를 바로 확인하기 어려운 축약·의심 링크 형태가 있습니다.",
                    weight=0.14,
                ))
                seen.add("SHORT_URL")

        external_checks = self._safe_browsing(urls if analysis_type == "SMISHING" else [])
        if external_checks.get("matches", 0) and "URL_REPUTATION" not in seen:
            indicators.append(FraudIndicator(
                code="URL_REPUTATION",
                category="위험 URL 데이터",
                evidence="공개 URL 위협 데이터에서 일치 신호가 확인되었습니다.",
                weight=0.55,
            ))

        score = sum(item.weight for item in indicators)
        codes = {item.code for item in indicators}
        if {"AUTHORITY", "TRANSFER"}.issubset(codes):
            score += 0.15
        if {"URL_PRESENT", "APP_INSTALL"}.issubset(codes):
            score += 0.15
        if {"GUARANTEED_RETURN", "TRANSFER"}.issubset(codes):
            score += 0.15
        score = round(min(1.0, score), 4)

        if score >= settings.fraud_high_threshold:
            risk_level = "HIGH"
        elif score >= settings.fraud_medium_threshold:
            risk_level = "MEDIUM"
        else:
            risk_level = "UNKNOWN"

        child_message, parent_message = self._messages(analysis_type, risk_level)
        return FraudAnalyzeResponse(
            analysis_type=analysis_type,
            risk_level=risk_level,
            risk_score=score,
            indicators=indicators,
            urls=urls,
            child_message=child_message,
            parent_message=parent_message,
            recommended_actions=self._actions(analysis_type, risk_level),
            external_checks=external_checks,
        )

    @staticmethod
    def _extract_urls(text: str) -> list[str]:
        unique: list[str] = []
        seen: set[str] = set()
        for match in URL_PATTERN.findall(text):
            url = match.rstrip(".,!?)]}>")
            if not url.lower().startswith(("http://", "https://")):
                url = "https://" + url
            key = url.casefold()
            if key not in seen:
                seen.add(key)
                unique.append(url)
        return unique[:10]

    @staticmethod
    def _looks_shortened(url: str) -> bool:
        lowered = url.lower()
        return any(host in lowered for host in (
            "bit.ly/", "tinyurl.com/", "url.kr/", "han.gl/", "vo.la/", "t.ly/", "c11.kr/"
        ))

    @staticmethod
    def _safe_browsing(urls: Iterable[str]) -> dict:
        checked_urls = list(urls)
        if not checked_urls:
            return {"provider": "GOOGLE_SAFE_BROWSING", "status": "NOT_NEEDED", "matches": 0}
        if not settings.safe_browsing_api_key:
            return {"provider": "GOOGLE_SAFE_BROWSING", "status": "NOT_CONFIGURED", "matches": 0}

        try:
            response = requests.post(
                settings.safe_browsing_url,
                params={"key": settings.safe_browsing_api_key},
                json={
                    "client": {"clientId": "dahum", "clientVersion": "3.0"},
                    "threatInfo": {
                        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                        "platformTypes": ["ANY_PLATFORM"],
                        "threatEntryTypes": ["URL"],
                        "threatEntries": [{"url": url} for url in checked_urls],
                    },
                },
                timeout=6,
            )
            response.raise_for_status()
            payload = response.json() if response.content else {}
            matches = payload.get("matches") or []
            return {
                "provider": "GOOGLE_SAFE_BROWSING",
                "status": "CHECKED",
                "matches": len(matches),
            }
        except Exception as exc:
            return {
                "provider": "GOOGLE_SAFE_BROWSING",
                "status": "ERROR",
                "matches": 0,
                "error": type(exc).__name__,
            }

    @staticmethod
    def _messages(analysis_type: FraudAnalysisType, risk_level: str) -> tuple[str, str]:
        subject = {
            "SMISHING": "문자",
            "VOICE_PHISHING": "통화 내용",
            "FINANCIAL_FRAUD": "금융 제안",
        }[analysis_type]
        if risk_level == "HIGH":
            return (
                f"{subject}에서 여러 사기 위험 신호가 겹쳐 확인됐어요. 상대가 요구한 송금·앱 설치·인증정보 전달을 중단하고 공식 기관 연락처로 다시 확인해 주세요.",
                f"부모님, 이 {subject}에는 사기에서 자주 나타나는 위험 신호가 여러 개 있어요. 돈을 보내거나 앱을 설치하거나 인증번호를 알려주지 마시고, 전화를 끊은 뒤 가족과 함께 공식 번호로 확인해 주세요.",
            )
        if risk_level == "MEDIUM":
            return (
                f"{subject}에서 확인이 필요한 위험 신호가 있어요. 바로 행동하지 말고 발신자·기관·링크를 독립적으로 확인해 주세요.",
                f"부모님, 이 {subject}은 바로 믿기보다 한 번 더 확인할 내용이 있어요. 링크를 누르거나 송금하기 전에 가족에게 먼저 보여 주세요.",
            )
        return (
            f"현재 {subject}만으로는 위험하거나 안전하다고 확정하기 어려워요. UNKNOWN은 안전 판정이 아니므로 출처를 별도로 확인해 주세요.",
            f"부모님, 지금 정보만으로는 이 {subject}이 안전하다고 확인된 것은 아니에요. 낯선 요청이라면 행동하지 말고 가족과 함께 확인해 주세요.",
        )

    @staticmethod
    def _actions(analysis_type: FraudAnalysisType, risk_level: str) -> list[str]:
        common = [
            "상대가 알려준 번호가 아니라 기관의 공식 홈페이지·카드 뒷면·공식 앱의 번호로 다시 확인합니다.",
            "인증번호·비밀번호·보안카드·신분증 정보를 전달하지 않습니다.",
        ]
        if analysis_type == "SMISHING":
            common.insert(0, "문자 속 링크를 바로 누르지 말고 주소를 별도로 확인합니다.")
            common.append("APK나 출처를 알 수 없는 앱 설치 요구는 거절합니다.")
        elif analysis_type == "VOICE_PHISHING":
            common.insert(0, "통화를 종료하고 가족에게 먼저 알립니다.")
            common.append("안전계좌·보호계좌 명목의 송금 요구에는 응하지 않습니다.")
        else:
            common.insert(0, "수익 보장·선입금·수수료 선납 요구가 있으면 거래를 멈춥니다.")
            common.append("투자·대출 상대의 회사명과 등록 여부를 공식 채널에서 별도로 확인합니다.")
        if risk_level == "HIGH":
            common.append("이미 송금했다면 즉시 금융회사에 지급정지 가능 여부를 문의하고 관련 증거를 보존합니다.")
        return common


fraud_analyzer = FraudAnalyzer()
