import { useState, useEffect, useRef, useCallback } from "react"

import { LoginScreen } from "@/pages/LoginScreen"
import { UploadScreen } from "@/pages/UploadScreen"
import { LoadingScreen } from "@/pages/LoadingScreen"
import { DetailScreen } from "@/pages/DetailScreen"
import { ParentGuideScreen } from "@/pages/ParentGuideScreen"

import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"
import svgDanger from "@/imports/ResultDangerScreen/svg-eijb8y654a"
import svgDetail from "@/imports/DetailScreen/svg-8kiebeh0qh"
import svgFailed from "@/imports/AnalysisFailedScreen/svg-77kkukwlrq"

import imgHeaderLogo from "@/imports/image-4.png"
import imgSymbol from "@/imports/image-5.png"

// ── Types ─────────────────────────────────────────────────────────────────────
type Verdict = "danger" | "caution" | "uncertain"
type Screen = "login" | "upload" | "loading" | "result" | "detail" | "parentGuide" | "failed" | "serviceIntro"
type ModalType = "terms" | "privacy" | "menu" | null

// ── Mock analysis ─────────────────────────────────────────────────────────────
interface AnalysisResult {
  verdict: Verdict
  similarity: number
  similarCount: number
}

function getMockResult(name: string): AnalysisResult | null {
  if (name.includes("실패") || name.includes("오류")) return null
  switch (name.trim()) {
    case "가짜은행 보안앱":
      return { verdict: "danger", similarity: 94, similarCount: 3 }
    case "스마트뱅킹 보안":
      return { verdict: "caution", similarity: 76, similarCount: 2 }
    case "우리집 가계부":
      return { verdict: "uncertain", similarity: 42, similarCount: 0 }
    default:
      return { verdict: "uncertain", similarity: 35, similarCount: 0 }
  }
}

// ── Verdict config ────────────────────────────────────────────────────────────
const VC = {
  danger: {
    badgeBg: "#fff1f1",
    badgeBorder: "#FF5C5C",
    badgeText: "#FF5C5C",
    badgeLabel: "위험 수준 매우 높음",
    cardBorder: "#FF5C5C",
    title: "이 앱은 보이스피싱일 가능성이 높아요",
    body: "여러 위험 신호가 감지되었습니다. 절대 개인정보를 입력하거나 앱을 설치하지 마세요.",
    barColor: "#FF5C5C",
    pctColor: "#FF5C5C",
    riskLabel: "위험 가능성",
    riskValue: "높음",
    riskColor: "#FF5C5C",
    malwareName: "Android.Trojan.Agent 계열",
    malwareSim: 92,
    malwareColor: "#FF5C5C",
    accordionItems: [
      {
        title: "유사 악성 앱 탐지 이력 있음",
        body: "알약 모바일 백신에서 유사한 악성 앱으로 탐지된 기록이 있습니다.\n진단명: Android.Trojan.Agent",
      },
      {
        title: "유사 악성코드 유형: Trojan",
        body: "정상 앱인 것처럼 위장해 설치된 뒤, 문자와 연락처를 탈취하는 유형입니다.",
      },
    ],
    guideVerb: "위험한 앱으로 판정되었어요",
    guideSub: "즉시 삭제해 주세요.",
    guideDelete: (n: string) => `설정 → 앱 → ${n} → 삭제 누르시면 돼요.`,
  },
  caution: {
    badgeBg: "#FFF7E6",
    badgeBorder: "#F59E0B",
    badgeText: "#B45309",
    badgeLabel: "확인 필요",
    cardBorder: "#F59E0B",
    title: "추가 확인이 필요한 앱이에요",
    body: "일부 의심스러운 특징이 발견되었습니다. 앱이 어디서 설치되었는지 확인해보세요.",
    barColor: "#F59E0B",
    pctColor: "#B45309",
    riskLabel: "위험 가능성",
    riskValue: "보통",
    riskColor: "#B45309",
    malwareName: "Android.Adware.Agent 계열",
    malwareSim: 65,
    malwareColor: "#F59E0B",
    accordionItems: [
      {
        title: "광고성 앱 패턴 감지",
        body: "사용자 동의 없이 광고를 노출하거나, 개인정보를 수집할 수 있는 패턴이 발견되었습니다.",
      },
      {
        title: "과도한 권한 요청",
        body: "앱 기능과 관련 없는 권한(연락처, 위치, 문자 등)을 요청하는 패턴이 있습니다.",
      },
    ],
    guideVerb: "주의가 필요한 앱으로 판정되었어요",
    guideSub: "꼭 필요하지 않으시면 삭제를 권장드려요.",
    guideDelete: (n: string) => `설정 → 앱 → ${n} → 삭제 누르시면 돼요.`,
  },
  uncertain: {
    badgeBg: "#f4f6fb",
    badgeBorder: "#c0cbdc",
    badgeText: "#7B8FAD",
    badgeLabel: "판단 보류",
    cardBorder: "#e2e8f0",
    title: "AI가 판단하기 어려운 앱이에요",
    body: "명확한 위험 신호는 감지되지 않았습니다. 앱 출처를 직접 확인해보시기 바랍니다.",
    barColor: "#94a3b8",
    pctColor: "#64748b",
    riskLabel: "위험 가능성",
    riskValue: "낮음",
    riskColor: "#64748b",
    malwareName: "유사 악성 앱 없음",
    malwareSim: 0,
    malwareColor: "#94a3b8",
    accordionItems: [
      {
        title: "탐지된 특이사항 없음",
        body: "현재 데이터베이스에서 유사한 악성 앱이 발견되지 않았습니다. 새로운 악성 앱이 등록될 수 있으므로 주의가 필요합니다.",
      },
    ],
    guideVerb: "명확한 위험은 발견되지 않았어요",
    guideSub: "그래도 모르는 앱이면 삭제하셔도 좋아요.",
    guideDelete: (n: string) => `설정 → 앱 → ${n}에서 앱 정보를 확인해보세요.`,
  },
}

function generateGuideText(appName: string, verdict: Verdict): string {
  const v = VC[verdict]
  return [
    `엄마, 아빠! 폰에 깔린 '${appName}'이라는 앱 확인해봤어요.`,
    "",
    `검사해 보니 ${v.guideVerb}. ${v.guideSub}`,
    "",
    `⚠️ ${v.guideDelete(appName)}`,
    "",
    "혹시 어려우시면 저한테 전화 주세요. 제가 도와드릴게요!",
  ].join("\n")
}

// ── Legal content ─────────────────────────────────────────────────────────────
const TERMS_CONTENT = `제1조 (목적)
본 약관은 닿음(이하 "서비스")의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (서비스 내용)
본 서비스는 의심스러운 앱의 악성 여부를 AI 기반으로 분석하여 사용자에게 안내하는 정보 제공 서비스입니다. 분석 결과는 참고용이며, 법적 효력을 갖지 않습니다.

제3조 (이용자의 의무)
이용자는 서비스를 이용하면서 관련 법령 및 본 약관의 규정을 준수해야 합니다. 이용자는 서비스를 악용하거나 타인의 권익을 침해하는 행위를 해서는 안 됩니다.

제4조 (면책조항)
서비스의 분석 결과는 보조적인 참고 정보로, 실제 보안 검사를 대체하지 않습니다. 운영자는 분석 결과의 정확성에 대해 보증하지 않으며, 이로 인한 손해에 대해 책임을 지지 않습니다.

제5조 (개인정보)
서비스 이용 시 수집되는 개인정보는 개인정보처리방침에 따라 처리됩니다.

제6조 (약관의 변경)
본 약관은 필요에 따라 변경될 수 있으며, 변경된 약관은 서비스 내 공지를 통해 안내됩니다.

⚠️ 본 약관은 프로토타입 데모용으로 작성된 내용이며 법적 효력이 없습니다.`

const PRIVACY_CONTENT = `1. 수집하는 개인정보
본 서비스는 다음의 개인정보를 수집합니다.
• 카카오 계정 정보 (이름, 프로필 이미지, 이메일)
• 앱 분석을 위해 업로드한 이미지
• 서비스 이용 기록 및 접속 로그

2. 개인정보 이용 목적
수집된 정보는 다음 목적으로만 활용됩니다.
• 앱 분석 서비스 제공
• 서비스 품질 개선 및 통계 분석
• 이용자 문의 응대

3. 개인정보 보유 기간
수집된 정보는 서비스 탈퇴 시까지 보관되며, 관련 법령에서 정한 보존 기간을 준수합니다.

4. 개인정보 제3자 제공
서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외로 합니다.

5. 이용자의 권리
이용자는 언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다. 문의: support@dateum.app

6. 개인정보 보호책임자
성명: 닿음 운영팀
이메일: privacy@dateum.app

⚠️ 본 방침은 프로토타입 데모용으로 작성된 내용이며 법적 효력이 없습니다.`

// ── Modals ────────────────────────────────────────────────────────────────────
function LegalModal({
  type,
  onClose,
}: {
  type: "terms" | "privacy"
  onClose: () => void
}) {
  const title = type === "terms" ? "이용약관" : "개인정보처리방침"
  const content = type === "terms" ? TERMS_CONTENT : PRIVACY_CONTENT

  return (
    <div className="absolute inset-0 z-50 bg-[#f8fafb] flex flex-col">
      {/* Header */}
      <div className="bg-white flex h-[56px] items-center gap-[12px] px-[24px] shrink-0">
        <button
          onClick={onClose}
          className="flex items-center justify-center size-[24px]"
        >
          <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
            <path
              d="M15 18L9 12L15 6"
              stroke="#1B3A5C"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">
          {title}
        </p>
      </div>
      <div aria-hidden className="border-b border-[#e2e8f0]" />
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
        <p className="font-['Pretendard'] font-normal leading-[1.8] text-[#334155] text-[14px] whitespace-pre-wrap">
          {content}
        </p>
      </div>
      {/* Home indicator */}
      <div className="flex items-start justify-center py-[12px] w-full shrink-0">
        <div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" />
      </div>
    </div>
  )
}

function MenuSheet({
  onClose,
  onShowTerms,
  onShowPrivacy,
  onShowServiceIntro,
}: {
  onClose: () => void
  onShowTerms: () => void
  onShowPrivacy: () => void
  onShowServiceIntro: () => void
}) {
  const Chevron = () => (
    <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M7 4.5L11.5 9L7 13.5"
        stroke="#94A3B8"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Sheet */}
      <div className="relative bg-white rounded-t-[24px]">
        {/* Drag handle */}
        <div className="flex justify-center pt-[12px] pb-[4px]">
          <div className="bg-[#e2e8f0] rounded-full h-[4px] w-[36px]" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px]">
          <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">
            메뉴
          </p>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-[32px] rounded-full bg-[#f1f5f9]"
          >
            <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="#64748B"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
        <div className="mx-[24px] h-px bg-[#f1f5f9]" />
        {/* Menu items */}
        <button
          onClick={onShowServiceIntro}
          className="flex items-center justify-between w-full px-[24px] py-[18px]"
        >
          <div className="flex items-center gap-[12px]">
            <div
              className="flex items-center justify-center size-[36px] rounded-[10px]"
              style={{
                background: "linear-gradient(135deg, #ebf0ff, #dce9ff)",
              }}
            >
              <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
                <circle
                  cx="9"
                  cy="9"
                  r="7"
                  stroke="#4F8CFF"
                  strokeWidth="1.5"
                />
                <path
                  d="M9 8v5M9 6v.5"
                  stroke="#4F8CFF"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[15px]">
              서비스 소개
            </p>
          </div>
          <Chevron />
        </button>
        <div className="mx-[24px] h-px bg-[#f1f5f9]" />
        <button
          onClick={onShowTerms}
          className="flex items-center justify-between w-full px-[24px] py-[18px]"
        >
          <div className="flex items-center gap-[12px]">
            <div
              className="flex items-center justify-center size-[36px] rounded-[10px]"
              style={{
                background: "linear-gradient(135deg, #ebe8ff, #d8d0ff)",
              }}
            >
              <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
                <path
                  d="M3 3.5A1.5 1.5 0 014.5 2h9A1.5 1.5 0 0115 3.5v11a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 14.5v-11zM6 6h6M6 9h6M6 12h4"
                  stroke="#7B6CFF"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[15px]">
              이용약관
            </p>
          </div>
          <Chevron />
        </button>
        <div className="mx-[24px] h-px bg-[#f1f5f9]" />
        <button
          onClick={onShowPrivacy}
          className="flex items-center justify-between w-full px-[24px] py-[18px]"
        >
          <div className="flex items-center gap-[12px]">
            <div
              className="flex items-center justify-center size-[36px] rounded-[10px]"
              style={{
                background: "linear-gradient(135deg, #fff0ee, #ffd8d8)",
              }}
            >
              <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
                <path
                  d="M9 1.5L2.5 4.5V9C2.5 12.6 5.3 16 9 17C12.7 16 15.5 12.6 15.5 9V4.5L9 1.5Z"
                  stroke="#FF8F8F"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M6.5 9l2 2 3-3"
                  stroke="#FF8F8F"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[15px]">
              개인정보처리방침
            </p>
          </div>
          <Chevron />
        </button>
        <div className="mx-[24px] h-px bg-[#f1f5f9]" />
        <div className="px-[24px] py-[16px]">
          <p className="font-['Pretendard'] font-normal text-[#94a3b8] text-[12px]">
            닿음 v1.0.0 (프로토타입)
          </p>
        </div>
        {/* Home indicator */}
        <div className="flex items-start justify-center py-[12px]">
          <div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  )
}

// ── Shared components ─────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <p className="font-['Pretendard'] font-semibold leading-[normal] relative shrink-0 text-[#0f172a] text-[15px] whitespace-nowrap">
        9:41
      </p>
      <div className="flex gap-[6px] items-center">
        <div className="relative shrink-0 size-[18px]">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              clipRule="evenodd"
              d={svgUpload.pc062070}
              fill="#0F172A"
              fillRule="evenodd"
            />
          </svg>
        </div>
        <div className="relative shrink-0 size-[18px]">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              clipRule="evenodd"
              d={svgUpload.p23837e00}
              fill="#0F172A"
              fillRule="evenodd"
            />
          </svg>
        </div>
        <div className="h-[18px] relative shrink-0 w-[26px]">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            viewBox="0 0 26 18"
          >
            <path d={svgUpload.p1f206500} fill="#0F172A" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function HomeIndicator() {
  return (
    <div className="flex items-start justify-center py-[12px] w-full">
      <div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" />
    </div>
  )
}

function BrandHeader({
  onMenuOpen,
  onLogoClick,
}: {
  onMenuOpen: () => void
  onLogoClick?: () => void
}) {
  return (
    <div className="bg-white content-stretch flex h-[56px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <button onClick={onLogoClick} className="flex gap-[12px] items-center">
        <div className="h-[36px] relative shrink-0 w-[36px]">
          <img
            alt="닿음 로고"
            className="w-full h-full object-contain"
            src={imgHeaderLogo}
          />
        </div>
        <p className="font-['Pretendard'] font-bold leading-[normal] shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">
          닿음
        </p>
      </button>
      <button
        onClick={onMenuOpen}
        className="flex flex-col items-center justify-center shrink-0 size-[24px]"
      >
        <svg
          className="block size-full"
          fill="none"
          height="24"
          viewBox="0 0 24 24"
          width="24"
        >
          <path
            d={svgUpload.p15b88b00}
            stroke="#1B3A5C"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  )
}

function BackHeader({
  title,
  onBack,
  onMenuOpen,
}: {
  title: string
  onBack: () => void
  onMenuOpen: () => void
}) {
  return (
    <div className="bg-white content-stretch flex h-[56px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <div className="flex gap-[12px] items-center">
        <button
          onClick={onBack}
          className="flex items-center justify-center shrink-0 size-[24px]"
        >
          <svg
            className="block size-full"
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#1B3A5C"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <p className="font-['Pretendard'] font-bold leading-[normal] shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">
          {title}
        </p>
      </div>
      <button
        onClick={onMenuOpen}
        className="flex flex-col items-center justify-center shrink-0 size-[24px]"
      >
        <svg
          className="block size-full"
          fill="none"
          height="24"
          viewBox="0 0 24 24"
          width="24"
        >
          <path
            d={svgDetail.p15b88b00}
            stroke="#1B3A5C"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  )
}

// ── Screen 4: Result (all verdicts) ──────────────────────────────────────────
function ResultScreen({
  appName,
  result,
  onDetail,
  onGuide,
  onAnalyzeAnother,
  onMenuOpen,
  onLogoClick,
}: {
  appName: string
  result: AnalysisResult
  onDetail: () => void
  onGuide: () => void
  onAnalyzeAnother: () => void
  onMenuOpen: () => void
  onLogoClick: () => void
}) {
  const v = VC[result.verdict]
  const isDanger = result.verdict === "danger"
  const isCaution = result.verdict === "caution"
  const isUncertain = result.verdict === "uncertain"

  const BadgeIcon = () => {
    if (isDanger)
      return (
        <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
          <path
            d={svgDanger.p119e80b0}
            stroke={v.badgeText}
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      )
    if (isCaution)
      return (
        <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
          <path
            d="M10 3.5L18.1 17H1.9L10 3.5Z"
            stroke={v.badgeText}
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M10 9v3M10 13.5v.5"
            stroke={v.badgeText}
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      )
    return (
      <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" stroke={v.badgeText} strokeWidth="2" />
        <path
          d="M10 7v4M10 13v.5"
          stroke={v.badgeText}
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    )
  }

  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full min-h-full">
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto">
        <StatusBar />
        <BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onLogoClick} />
        <div className="flex flex-col gap-[20px] px-4 py-6 min-[390px]:px-6 w-full">
          <div className="flex justify-center w-full">
            <div
              className="flex gap-[8px] items-center px-[16px] py-[10px] rounded-[100px]"
              style={{
                backgroundColor: v.badgeBg,
                border: `1px solid ${v.badgeBorder}`,
              }}
            >
              <BadgeIcon />
              <p
                className="font-['Pretendard'] font-bold text-[14px] whitespace-nowrap"
                style={{ color: v.badgeText }}
              >
                {v.badgeLabel}
              </p>
            </div>
          </div>
          <div className="bg-white flex flex-col gap-[16px] p-[24px] relative rounded-[20px] w-full">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none rounded-[20px]"
              style={{ border: `1px solid ${v.cardBorder}` }}
            />
            <p className="font-['Pretendard'] font-bold leading-[1.4] text-[#1b3a5c] text-[20px] w-full">
              {v.title}
            </p>
            <p className="font-['Pretendard'] font-medium leading-[1.5] text-[#64748b] text-[14px] w-full">
              {v.body}
            </p>
            <div className="flex flex-col gap-[6px] pt-[12px] w-full">
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter'] font-normal text-[#64748b] text-[12px]">
                  악성 앱 유사도
                </p>
                <p
                  className="font-['Pretendard'] font-bold text-[12px]"
                  style={{ color: v.pctColor }}
                >
                  {result.similarity}%
                </p>
              </div>
              <div className="bg-[#e2e8f0] h-[8px] overflow-clip rounded-[4px] w-full">
                <div
                  className="h-full rounded-[4px]"
                  style={{
                    width: `${result.similarity}%`,
                    backgroundColor: v.barColor,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col gap-[14px] p-[20px] relative rounded-[16px] w-full">
            <div
              aria-hidden
              className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]"
            />
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px] whitespace-nowrap">
              분석된 앱 정보
            </p>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px]">
              앱 이름: {appName}
            </p>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[13px]">
              유사 악성 앱: {result.similarCount}건
            </p>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[13px]">
              분석 기준: 알약 모바일 악성코드 탐지 데이터
            </p>
          </div>
          <div className="bg-white flex flex-col gap-[6px] p-[16px] relative rounded-[16px] w-full">
            <div
              aria-hidden
              className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]"
            />
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px] whitespace-nowrap">
              {v.riskLabel}
            </p>
            <p
              className="font-['Pretendard'] font-semibold text-[13px]"
              style={{ color: v.riskColor }}
            >
              {v.riskValue}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[12px] pb-[8px] px-[24px] shrink-0 w-full">
        <div className="flex flex-col gap-[8px] w-full">
          <button
            onClick={onGuide}
            className="flex gap-[8px] h-[54px] items-center justify-center rounded-[14px] w-full"
            style={{
              background: "linear-gradient(90deg, #4F8CFF 0%, #7B6CFF 100%)",
            }}
          >
            <svg
              className="block size-[18px]"
              fill="none"
              height="18"
              viewBox="0 0 18 18"
              width="18"
            >
              <g clipPath="url(#clip-send)">
                <path
                  d={svgDanger.p3df57c00}
                  stroke="white"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </g>
              <defs>
                <clipPath id="clip-send">
                  <rect fill="white" height="18" width="18" />
                </clipPath>
              </defs>
            </svg>
            <p className="font-['Pretendard'] font-bold text-[16px] text-white whitespace-nowrap">
              부모님께 안내문 보내기
            </p>
          </button>
          {!isUncertain && (
            <button
              onClick={onDetail}
              className="bg-white flex h-[50px] items-center justify-center relative rounded-[14px] w-full"
            >
              <div
                aria-hidden
                className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]"
              />
              <p className="font-['Pretendard'] font-semibold text-[#64748b] text-[14px] whitespace-nowrap">
                상세 정보 보기
              </p>
            </button>
          )}
          <button
            onClick={onAnalyzeAnother}
            className="bg-white flex h-[42px] items-center justify-center relative rounded-[12px] w-full"
          >
            <div
              aria-hidden
              className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
            />
            <p className="font-['Pretendard'] font-medium text-[#64748b] text-[13px] whitespace-nowrap">
              다른 앱 분석하기
            </p>
          </button>
        </div>
        <HomeIndicator />
      </div>
    </div>
  )
}

// ── Screen 7: Analysis Failed ─────────────────────────────────────────────────
function FailedScreen({
  onSelectImage,
  onTypeAppName,
  onMenuOpen,
  onLogoClick,
}: {
  onSelectImage: () => void
  onTypeAppName: () => void
  onMenuOpen: () => void
  onLogoClick: () => void
}) {
  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full min-h-full">
      <div className="flex flex-col w-full">
        <StatusBar />
        <BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onLogoClick} />
        <div className="flex flex-col gap-[24px] items-center p-[24px] w-full">
          <div className="bg-white flex items-center justify-center relative rounded-[60px] size-[120px]">
            <div
              aria-hidden
              className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[60px]"
            />
            <div className="bg-[#fff1f1] flex items-center justify-center rounded-[32px] size-[64px]">
              <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
                <path
                  d={svgFailed.p311ec080}
                  stroke="#FF5C5C"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-[8px] items-center text-center w-full">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[22px] whitespace-nowrap">
              분석에 실패했어요
            </p>
            <p className="font-['Pretendard'] font-normal leading-[1.4] text-[#64748b] text-[14px] w-full">
              이미지를 인식하지 못했거나 일시적인 오류가 발생했어요
            </p>
          </div>
          <div className="bg-white flex flex-col gap-[14px] p-[20px] relative rounded-[16px] w-full">
            <div
              aria-hidden
              className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]"
            />
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px] whitespace-nowrap">
              이런 경우일 수 있어요
            </p>
            {[
              "이미지가 흐리거나 잘린 경우",
              "텍스트가 포함되지 않은 이미지",
              "서버 연결이 불안정한 경우",
            ].map((reason) => (
              <div key={reason} className="flex gap-[10px] items-center w-full">
                <div className="bg-[#FF5C5C] rounded-[3px] shrink-0 size-[6px]" />
                <p className="font-['Pretendard'] font-medium text-[#1b3a5c] text-[13px]">
                  {reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[12px] pb-[8px] px-[24px] shrink-0 w-full">
        <div className="flex flex-col gap-[8px] w-full">
          {/* Primary: select a different image */}
          <button
            onClick={onSelectImage}
            className="flex h-[54px] items-center justify-center rounded-[14px] w-full"
            style={{
              background: "linear-gradient(90deg, #4F8CFF 0%, #7B6CFF 100%)",
            }}
          >
            <p className="font-['Pretendard'] font-bold text-[16px] text-white whitespace-nowrap">
              다른 이미지 선택
            </p>
          </button>
          {/* Secondary: type app name directly (focuses input) */}
          <button
            onClick={onTypeAppName}
            className="bg-white flex h-[50px] items-center justify-center relative rounded-[14px] w-full"
          >
            <div
              aria-hidden
              className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]"
            />
            <p className="font-['Pretendard'] font-semibold text-[#64748b] text-[14px] whitespace-nowrap">
              앱 이름 직접 입력하기
            </p>
          </button>
        </div>
        <HomeIndicator />
      </div>
    </div>
  )
}

// ── Screen: Service Intro ─────────────────────────────────────────────────────
function ServiceIntroScreen({ onBack }: { onBack: () => void }) {
  const values = [
    {
      color: "#4F8CFF",
      label: "신뢰",
      desc: "검증된 보안 데이터 기반의 정확한 분석",
    },
    {
      color: "#7B6CFF",
      label: "연결",
      desc: "자녀와 부모님을 잇는 따뜻한 알림",
    },
    {
      color: "#FF8F8F",
      label: "따뜻함",
      desc: "누구나 이해하기 쉬운 친절한 안내",
    },
  ]

  return (
    <div className="bg-[#f8fafb] flex flex-col relative w-full min-h-full">
      <StatusBar />
      {/* Header */}
      <div className="bg-white flex h-[56px] items-center gap-[12px] px-[24px] shrink-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center size-[24px]"
        >
          <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
            <path
              d="M15 18L9 12L15 6"
              stroke="#1B3A5C"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">
          서비스 소개
        </p>
      </div>
      <div aria-hidden className="border-b border-[#e2e8f0]" />

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="flex flex-col gap-[6px] items-center px-[24px] pt-[40px] pb-[32px] w-full">
          <img
            src={imgSymbol}
            alt="닿음 로고 심볼"
            className="w-[72px] h-[72px] object-contain"
          />
          <p className="font-['Pretendard'] font-extrabold text-[#1b3a5c] text-[26px] leading-[33.8px] text-center whitespace-nowrap">
            마음도 · 안전도 · 닿다
          </p>
          <p className="font-['Pretendard'] font-medium text-[#64748b] text-[13px] text-center pt-[4px]">
            닿음 — 디지털 보안 케어 서비스
          </p>
        </div>

        {/* Description card */}
        <div className="mx-[24px] mb-[24px] bg-white rounded-[20px] p-[24px] relative">
          <div
            aria-hidden
            className="absolute inset-0 border border-[#e2e8f0] rounded-[20px] pointer-events-none"
          />
          <p className="font-['Pretendard'] font-normal leading-[1.8] text-[#334155] text-[15px]">
            <span className="font-bold text-[#1b3a5c]">닿음</span>은 자녀와
            부모의 마음이 이어지고, 위험 알림이 행동으로 닿도록 돕는 디지털 보안
            케어 서비스입니다.
          </p>
          <div className="mt-[16px] h-px bg-[#f1f5f9]" />
          <p className="font-['Pretendard'] font-normal leading-[1.8] text-[#334155] text-[15px] mt-[16px]">
            부모님이 보내주신 앱 화면이나 앱 이름을 분석해 위험 가능성을
            확인하고, 이해하기 쉬운 안내문으로 전달할 수 있도록 도와드려요.
          </p>
        </div>

        {/* How it works */}
        <div className="mx-[24px] mb-[24px]">
          <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[15px] mb-[12px]">
            이렇게 사용해요
          </p>
          <div className="flex flex-col gap-[10px]">
            {[
              { step: "01", label: "앱 화면 업로드 또는 앱 이름 입력" },
              { step: "02", label: "AI가 악성 앱 데이터베이스와 비교 분석" },
              { step: "03", label: "위험도 결과 확인 및 부모님께 안내문 전달" },
            ].map(({ step, label }) => (
              <div
                key={step}
                className="bg-white flex items-center gap-[16px] px-[18px] py-[14px] rounded-[14px] relative"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 border border-[#e2e8f0] rounded-[14px] pointer-events-none"
                />
                <span className="font-['Inter'] font-bold text-[#4F8CFF] text-[13px] shrink-0 w-[20px]">
                  {step}
                </span>
                <p className="font-['Pretendard'] font-medium text-[#1b3a5c] text-[14px]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mx-[24px] mb-[32px]">
          <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[15px] mb-[12px]">
            닿음이 지키는 가치
          </p>
          <div className="flex flex-col gap-[10px]">
            {values.map(({ color, label, desc }) => (
              <div
                key={label}
                className="bg-white flex items-center gap-[16px] px-[18px] py-[16px] rounded-[16px] relative"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[16px] pointer-events-none"
                  style={{ border: `1.5px solid ${color}33` }}
                />
                <div
                  className="flex items-center justify-center size-[42px] rounded-[14px] shrink-0"
                  style={{ backgroundColor: color + "18" }}
                >
                  <div
                    className="size-[14px] rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="flex flex-col gap-[2px]">
                  <p
                    className="font-['Pretendard'] font-bold text-[14px]"
                    style={{ color }}
                  >
                    {label}
                  </p>
                  <p className="font-['Pretendard'] font-normal text-[#64748b] text-[12px]">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("login")
  const [appName, setAppName] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [modal, setModal] = useState<ModalType>(null)
  const [focusAppName, setFocusAppName] = useState(false)

  const openMenu = useCallback(() => setModal("menu"), [])
  const openTerms = useCallback(() => setModal("terms"), [])
  const openPrivacy = useCallback(() => setModal("privacy"), [])
  const closeModal = useCallback(() => setModal(null), [])
  const openServiceIntro = useCallback(() => {
    setModal(null)
    setScreen("serviceIntro")
  }, [])

  const handleAnalyze = useCallback((name: string, img: string | null) => {
    setAppName(name)
    setImageUrl(img)
    setScreen("loading")
  }, [])

  const handleLoadingDone = useCallback(() => {
    const r = getMockResult(appName)
    if (!r) {
      setScreen("failed")
    } else {
      setResult(r)
      setScreen("result")
    }
  }, [appName])

  const resetAndGoToUpload = useCallback(() => {
    setAppName("")
    setImageUrl(null)
    setResult(null)
    setFocusAppName(false)
    setScreen("upload")
  }, [])

  const failedSelectImage = useCallback(() => {
    setImageUrl(null)
    setFocusAppName(false)
    setScreen("upload")
  }, [])

  const failedTypeAppName = useCallback(() => {
    setImageUrl(null)
    setFocusAppName(true)
    setScreen("upload")
  }, [])

  // Reset focusAppName after screen changes away from upload
  useEffect(() => {
    if (screen !== "upload") setFocusAppName(false)
  }, [screen])

  return (
    <div
      className="flex items-start justify-center bg-[#e8edf5]"
      style={{ minHeight: "100dvh" }}
    >
      <div
        className="relative bg-[#f8fafb] w-full flex flex-col"
        style={{
          maxWidth: 430,
          height: "100dvh",
        }}
      >
        {screen === "login" && (
          <LoginScreen
            onNext={() => setScreen("upload")}
            onShowTerms={openTerms}
            onShowPrivacy={openPrivacy}
          />
        )}
        {screen === "upload" && (
          <UploadScreen
            initialAppName={appName}
            initialImageUrl={imageUrl}
            focusAppName={focusAppName}
            onAnalyze={handleAnalyze}
            onMenuOpen={openMenu}
            onLogoClick={resetAndGoToUpload}
          />
        )}
        {screen === "loading" && (
          <LoadingScreen
            onDone={handleLoadingDone}
            onMenuOpen={openMenu}
            onLogoClick={resetAndGoToUpload}
          />
        )}
        {screen === "result" && result && (
          <ResultScreen
            appName={appName}
            result={result}
            onDetail={() => setScreen("detail")}
            onGuide={() => setScreen("parentGuide")}
            onAnalyzeAnother={resetAndGoToUpload}
            onMenuOpen={openMenu}
            onLogoClick={resetAndGoToUpload}
          />
        )}
        {screen === "detail" && result && (
          <DetailScreen
            appName={appName}
            result={result}
            onBack={() => setScreen("result")}
            onMenuOpen={openMenu}
          />
        )}
        {screen === "parentGuide" && result && (
          <ParentGuideScreen
            appName={appName}
            result={result}
            onBack={() => setScreen("result")}
            onMenuOpen={openMenu}
            onAnalyzeAnother={resetAndGoToUpload}
          />
        )}
        {screen === "failed" && (
          <FailedScreen
            onSelectImage={failedSelectImage}
            onTypeAppName={failedTypeAppName}
            onMenuOpen={openMenu}
            onLogoClick={resetAndGoToUpload}
          />
        )}
        {screen === "serviceIntro" && (
          <ServiceIntroScreen onBack={() => setScreen("upload")} />
        )}

        {/* Menu sheet */}
        {modal === "menu" && (
          <MenuSheet
            onClose={closeModal}
            onShowTerms={() => setModal("terms")}
            onShowPrivacy={() => setModal("privacy")}
            onShowServiceIntro={openServiceIntro}
          />
        )}

        {/* Legal modals */}
        {(modal === "terms" || modal === "privacy") && (
          <LegalModal type={modal} onClose={closeModal} />
        )}
      </div>
    </div>
  )
}
