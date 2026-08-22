import { useCallback, useEffect, useState } from "react"

import { getMe, startKakaoLogin } from "@/api/auth"
import { analyzeImage, analyzeText, type AnalyzeResponse, type AnalyzeResultItem } from "@/api/analyze"
import { DetailScreen } from "@/pages/DetailScreen"
import { FailedScreen } from "@/pages/FailedScreen"
import { FamilyScreen } from "@/pages/FamilyScreen"
import { FraudScreen } from "@/pages/FraudScreen"
import { HistoryDetailScreen } from "@/pages/HistoryDetailScreen"
import { HistoryScreen } from "@/pages/HistoryScreen"
import { LoadingScreen } from "@/pages/LoadingScreen"
import { LoginScreen } from "@/pages/LoginScreen"
import { ParentGuideScreen } from "@/pages/ParentGuideScreen"
import { ResultScreen } from "@/pages/ResultScreen"
import { ServiceIntroScreen } from "@/pages/ServiceIntroScreen"
import { UploadScreen } from "@/pages/UploadScreen"

import imgSymbol from "@/imports/image-5.png"

type Verdict = "danger" | "caution" | "uncertain"
type Screen = "login" | "upload" | "loading" | "result" | "detail" | "parentGuide" | "failed" | "serviceIntro" | "history" | "historyDetail" | "family" | "fraud"
type ModalType = "terms" | "privacy" | "menu" | null

interface AnalysisResult {
  verdict: Verdict
  similarity: number
  similarCount: number
  malwareName?: string
  malwareCategory?: string
  matchType?: "EXACT" | "VECTOR" | "NONE"
  evidenceSummary?: string
  childMessage?: string
  parentMessage?: string
  recommendedActions?: string[]
}

function primaryResult(api: AnalyzeResponse): AnalyzeResultItem | null {
  if (!api.results?.length) return null
  const rank = { HIGH: 3, MEDIUM: 2, UNKNOWN: 1 } as const
  return [...api.results].sort((a, b) => rank[b.risk_level] - rank[a.risk_level])[0]
}

function mapApiResult(api: AnalyzeResponse): { ui: AnalysisResult; primary: AnalyzeResultItem } | null {
  const primary = primaryResult(api)
  if (!primary) return null
  const verdict: Verdict = primary.risk_level === "HIGH" ? "danger" : primary.risk_level === "MEDIUM" ? "caution" : "uncertain"
  const similarity = primary.risk_level === "HIGH" ? 100 : Math.round((primary.similarity_score || 0) * 100)
  return {
    primary,
    ui: {
      verdict,
      similarity: Math.max(0, Math.min(100, similarity)),
      similarCount: primary.risk_level === "UNKNOWN" ? 0 : primary.matched_examples?.length || 0,
      malwareName: primary.malware_names?.[0] || primary.matched_examples?.[0]?.malware_name,
      malwareCategory: primary.malware_categories?.[0] || primary.matched_examples?.[0]?.malware_category,
      matchType: primary.match_type,
      evidenceSummary: primary.evidence_summary,
      childMessage: primary.child_message,
      parentMessage: primary.parent_message,
      recommendedActions: primary.recommended_actions || [],
    },
  }
}

const TERMS_CONTENT = `제1조 (목적)\n닿음은 의심스러운 앱·문자·통화·금융 제안 정보를 분석하고 이해하기 쉬운 보안 안내를 제공하는 프로토타입 서비스입니다.\n\n제2조 (분석 결과)\n분석 결과는 보조 정보이며 전문 보안 검사나 수사기관의 판단을 대체하지 않습니다. UNKNOWN은 안전 판정을 의미하지 않습니다.\n\n제3조 (이용자 의무)\n이용자는 관련 법령을 준수하고 타인의 권리를 침해하는 방식으로 서비스를 사용하지 않아야 합니다.\n\n⚠️ 본 문구는 해커톤 프로토타입 안내용입니다.`
const PRIVACY_CONTENT = `1. 처리 정보\n앱 분석을 위해 사용자가 직접 입력한 앱 정보, OCR 분석을 위해 전송한 이미지, 사기 위험 확인을 위해 입력한 텍스트와 분석 결과를 처리할 수 있습니다. 통화 녹음 원본은 저장하지 않으며 STT 처리 후 분석에만 사용합니다.\n\n2. 이용 목적\n악성 앱·스미싱·보이스피싱·금융사기 위험 분석, 가족용 안내문 및 가족 보안 알림 제공에 사용합니다.\n\n3. 주의사항\n운영 전 실제 보유·파기 기간과 개인정보 처리 절차는 최종 법률·보안 검토에 맞춰 확정해야 합니다.\n\n⚠️ 본 문구는 해커톤 프로토타입 안내용입니다.`

function LegalModal({ type, onClose }: { type: "terms" | "privacy"; onClose: () => void }) {
  const title = type === "terms" ? "이용약관" : "개인정보처리방침"
  const content = type === "terms" ? TERMS_CONTENT : PRIVACY_CONTENT
  return <div className="absolute inset-0 z-50 bg-[#f8fafb] flex flex-col"><div className="bg-white flex h-[56px] items-center gap-[12px] px-[24px] shrink-0"><button onClick={onClose} className="flex items-center justify-center size-[24px]"><svg fill="none" viewBox="0 0 24 24" className="size-full"><path d="M15 18L9 12L15 6" stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" /></svg></button><p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">{title}</p></div><div className="border-b border-[#e2e8f0]" /><div className="flex-1 overflow-y-auto px-[24px] py-[20px]"><p className="font-['Pretendard'] leading-[1.8] text-[#334155] text-[14px] whitespace-pre-wrap">{content}</p></div></div>
}

function MenuSheet({ onClose, onShowServiceIntro, onShowHistory, onShowFamily, onShowFraud, onShowTerms, onShowPrivacy }: { onClose: () => void; onShowServiceIntro: () => void; onShowHistory: () => void; onShowFamily: () => void; onShowFraud: () => void; onShowTerms: () => void; onShowPrivacy: () => void }) {
  const items = [
    { label: "분석 이력", action: onShowHistory },
    { label: "가족 연결", action: onShowFamily },
    { label: "스미싱·보이스피싱·금융사기", action: onShowFraud },
    { label: "서비스 소개", action: onShowServiceIntro },
    { label: "이용약관", action: onShowTerms },
    { label: "개인정보처리방침", action: onShowPrivacy },
  ]
  return <div className="absolute inset-0 z-40 flex flex-col justify-end"><button aria-label="메뉴 닫기" className="absolute inset-0 bg-black/40" onClick={onClose} /><div className="relative bg-white rounded-t-[24px] pb-[18px]"><div className="flex justify-center pt-[12px] pb-[4px]"><div className="bg-[#e2e8f0] rounded-full h-[4px] w-[36px]" /></div><div className="flex items-center justify-between px-[24px] py-[16px]"><div className="flex items-center gap-[10px]"><img src={imgSymbol} alt="" className="size-[28px] object-contain" /><p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">메뉴</p></div><button onClick={onClose} className="size-[32px] rounded-full bg-[#f1f5f9] text-[#64748b]">×</button></div><div className="mx-[24px] h-px bg-[#f1f5f9]" />{items.map((item) => <button key={item.label} onClick={item.action} className="flex items-center justify-between w-full px-[24px] py-[15px]"><p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px] text-left">{item.label}</p><span className="text-[#94a3b8]">›</span></button>)}<p className="px-[24px] pt-[6px] font-['Pretendard'] text-[#94a3b8] text-[12px]">닿음 v3 · Family Security Platform</p></div></div>
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login")
  const [appName, setAppName] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [apiResult, setApiResult] = useState<AnalyzeResponse | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [focusAppName, setFocusAppName] = useState(false)
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalType>(null)

  useEffect(() => {
    const invite = new URLSearchParams(window.location.search).get("invite")
    if (invite) localStorage.setItem("dahum_pending_invite", invite)
    getMe().then((me) => {
      if (!me.authenticated) return
      const hasInvite = Boolean(localStorage.getItem("dahum_pending_invite"))
      setScreen(hasInvite ? "family" : "upload")
      if (window.location.search) window.history.replaceState({}, "", window.location.pathname)
    }).catch(() => undefined)
  }, [])

  const resetAndGoToUpload = useCallback(() => { setAppName(""); setImageUrl(null); setResult(null); setApiResult(null); setAnalysisComplete(false); setFocusAppName(false); setScreen("upload") }, [])
  const handleAnalyze = useCallback(async (name: string, img: string | null, imageFile: File | null) => {
    setAppName(name); setImageUrl(img); setResult(null); setApiResult(null); setAnalysisComplete(false); setScreen("loading")
    try {
      const response = imageFile ? await analyzeImage(imageFile) : await analyzeText(name.trim())
      setApiResult(response); setAnalysisComplete(true)
    } catch (error) { console.error("분석 요청 실패:", error); setScreen("failed") }
  }, [])
  const handleLoadingDone = useCallback(() => {
    if (!apiResult) return
    const mapped = mapApiResult(apiResult)
    if (!mapped) { setScreen("failed"); return }
    setResult(mapped.ui)
    setAppName(mapped.primary.display_query || mapped.primary.package_name || appName || "분석된 앱")
    setScreen("result")
  }, [apiResult, appName])
  const openHistory = useCallback(() => { setModal(null); setScreen("history") }, [])
  const openServiceIntro = useCallback(() => { setModal(null); setScreen("serviceIntro") }, [])
  const openFamily = useCallback(() => { setModal(null); setScreen("family") }, [])
  const openFraud = useCallback(() => { setModal(null); setScreen("fraud") }, [])

  return <div className="flex items-start justify-center bg-[#e8edf5]" style={{ minHeight: "100dvh" }}><div className="relative bg-[#f8fafb] w-full flex flex-col" style={{ maxWidth: 430, height: "100dvh" }}>
    {screen === "login" && <LoginScreen onKakaoLogin={startKakaoLogin} onShowTerms={() => setModal("terms")} onShowPrivacy={() => setModal("privacy")} />}
    {screen === "upload" && <UploadScreen initialAppName={appName} initialImageUrl={imageUrl} focusAppName={focusAppName} onAnalyze={handleAnalyze} onMenuOpen={() => setModal("menu")} onLogoClick={resetAndGoToUpload} />}
    {screen === "loading" && <LoadingScreen isComplete={analysisComplete} onDone={handleLoadingDone} onMenuOpen={() => setModal("menu")} onLogoClick={resetAndGoToUpload} />}
    {screen === "result" && result && <ResultScreen appName={appName} result={result} onDetail={() => setScreen("detail")} onGuide={() => setScreen("parentGuide")} onAnalyzeAnother={resetAndGoToUpload} onMenuOpen={() => setModal("menu")} onLogoClick={resetAndGoToUpload} />}
    {screen === "detail" && result && <DetailScreen appName={appName} result={result} onBack={() => setScreen("result")} onMenuOpen={() => setModal("menu")} />}
    {screen === "parentGuide" && result && <ParentGuideScreen appName={appName} result={result} onBack={() => setScreen("result")} onMenuOpen={() => setModal("menu")} onAnalyzeAnother={resetAndGoToUpload} />}
    {screen === "failed" && <FailedScreen onSelectImage={() => setScreen("upload")} onTypeAppName={() => { setFocusAppName(true); setScreen("upload") }} onMenuOpen={() => setModal("menu")} onLogoClick={resetAndGoToUpload} />}
    {screen === "serviceIntro" && <ServiceIntroScreen onBack={() => setScreen("upload")} onMenuOpen={() => setModal("menu")} />}
    {screen === "history" && <HistoryScreen onBack={() => setScreen("upload")} onOpen={(scanId) => { setSelectedScanId(scanId); setScreen("historyDetail") }} />}
    {screen === "historyDetail" && selectedScanId && <HistoryDetailScreen scanId={selectedScanId} onBack={() => setScreen("history")} />}
    {screen === "family" && <FamilyScreen onBack={() => setScreen("upload")} />}
    {screen === "fraud" && <FraudScreen onBack={() => setScreen("upload")} />}
    {modal === "menu" && <MenuSheet onClose={() => setModal(null)} onShowServiceIntro={openServiceIntro} onShowHistory={openHistory} onShowFamily={openFamily} onShowFraud={openFraud} onShowTerms={() => setModal("terms")} onShowPrivacy={() => setModal("privacy")} />}
    {(modal === "terms" || modal === "privacy") && <LegalModal type={modal} onClose={() => setModal(null)} />}
  </div></div>
}
