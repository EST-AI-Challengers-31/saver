import { useState } from "react"
import svgGuide from "@/imports/ParentGuideScreen/svg-w77zqixszq"
import svgDetail from "@/imports/DetailScreen/svg-8kiebeh0qh"
import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"

export type Verdict = "danger" | "caution" | "uncertain"

export interface AnalysisResult {
  verdict: Verdict
  similarity: number
  similarCount: number
}

const VC = {
  danger: {
    badgeBg: "#fff1f1",
    badgeBorder: "#FF5C5C",
    badgeText: "#FF5C5C",
    badgeLabel: "위험 수준 매우 높음",
    guideVerb: "위험한 앱으로 판정되었어요",
    guideSub: "즉시 삭제해 주세요.",
    guideDelete: (n: string) => `설정 → 앱 → ${n} → 삭제 누르시면 돼요.`,
  },
  caution: {
    badgeBg: "#FFF7E6",
    badgeBorder: "#F59E0B",
    badgeText: "#B45309",
    badgeLabel: "확인 필요",
    guideVerb: "주의가 필요한 앱으로 판정되었어요",
    guideSub: "꼭 필요하지 않으시면 삭제를 권장드려요.",
    guideDelete: (n: string) => `설정 → 앱 → ${n} → 삭제 누르시면 돼요.`,
  },
  uncertain: {
    badgeBg: "#f4f6fb",
    badgeBorder: "#c0cbdc",
    badgeText: "#7B8FAD",
    badgeLabel: "판단 보류",
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

function HomeIndicator() {
  return (
    <div className="flex items-start justify-center py-[12px] w-full">
      <div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" />
    </div>
  )
}

interface ParentGuideScreenProps {
  appName: string
  result: AnalysisResult
  onBack: () => void
  onMenuOpen: () => void
  onAnalyzeAnother: () => void
}

export function ParentGuideScreen({
  appName,
  result,
  onBack,
  onMenuOpen,
  onAnalyzeAnother,
}: ParentGuideScreenProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const guideText = generateGuideText(appName, result.verdict)
  const v = VC[result.verdict]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(guideText)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = guideText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2500)
  }

  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full min-h-full">
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto">
        <StatusBar />
        <BackHeader
          title="부모님용 안내문"
          onBack={onBack}
          onMenuOpen={onMenuOpen}
        />
        <div className="flex flex-col gap-[24px] p-[24px] w-full">
          <div className="flex flex-col gap-[8px] w-full">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[20px] w-full">
              부모님께 보낼 안내문
            </p>
            <p className="font-['Pretendard'] font-normal text-[#64748b] text-[14px] w-full">
              부모님이 쉽게 이해하실 수 있도록 다정하고 분명한 말투로 작성된
              맞춤 안내문입니다.
            </p>
          </div>
          <div className="bg-white flex flex-col gap-[16px] p-[20px] relative rounded-[16px] w-full">
            <div
              aria-hidden
              className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]"
            />
            <div className="flex items-center justify-between w-full">
              <p className="font-['Pretendard'] font-bold text-[#7B6CFF] text-[12px] uppercase whitespace-nowrap">
                안내문 미리보기
              </p>
              <svg
                className="block size-[16px]"
                fill="none"
                height="16"
                viewBox="0 0 16 16"
                width="16"
              >
                <path
                  d={svgGuide.p2d6e42c0}
                  stroke="#7B6CFF"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <p className="font-['Pretendard'] font-normal leading-[1.6] text-[#1b3a5c] text-[14px] w-full whitespace-pre-wrap">
              {guideText}
            </p>
          </div>
          <div className="flex justify-center w-full">
            <div
              className="flex gap-[6px] items-center px-[12px] py-[6px] rounded-[100px]"
              style={{
                backgroundColor: v.badgeBg,
                border: `1px solid ${v.badgeBorder}`,
              }}
            >
              <div
                className="rounded-full size-[6px]"
                style={{ backgroundColor: v.badgeText }}
              />
              <p
                className="font-['Pretendard'] font-semibold text-[11px] whitespace-nowrap"
                style={{ color: v.badgeText }}
              >
                {v.badgeLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[10px] pb-[8px] px-[24px] shrink-0 w-full">
        {copySuccess && (
          <div className="bg-[#ecfdf5] flex gap-[10px] items-center justify-center px-[16px] py-[12px] relative rounded-[12px] w-full">
            <div
              aria-hidden
              className="absolute border border-[#059669] border-solid inset-0 pointer-events-none rounded-[12px]"
            />
            <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
              <g clipPath="url(#clip-check-guide)">
                <path
                  d={svgGuide.p39f7ce80}
                  stroke="#059669"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </g>
              <defs>
                <clipPath id="clip-check-guide">
                  <rect fill="white" height="16" width="16" />
                </clipPath>
              </defs>
            </svg>
            <p className="font-['Pretendard'] font-semibold text-[#059669] text-[13px] whitespace-nowrap">
              복사되었습니다! 부모님께 메시지를 보내주세요
            </p>
          </div>
        )}
        <div className="flex flex-col gap-[8px] w-full">
          <button
            onClick={handleCopy}
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
              <g clipPath="url(#clip-copy-guide)">
                <path
                  d={svgGuide.p1d6f9e80}
                  stroke="white"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </g>
              <defs>
                <clipPath id="clip-copy-guide">
                  <rect fill="white" height="18" width="18" />
                </clipPath>
              </defs>
            </svg>
            <p className="font-['Pretendard'] font-bold text-[16px] text-white whitespace-nowrap">
              클립보드에 복사하기
            </p>
          </button>
          <button className="bg-[#fee500] flex gap-[8px] h-[50px] items-center justify-center rounded-[14px] w-full">
            <svg
              className="block size-[18px]"
              fill="none"
              height="18"
              viewBox="0 0 18 18"
              width="18"
            >
              <g clipPath="url(#clip-kakao-guide)">
                <path
                  d={svgGuide.p16ccbb80}
                  stroke="#181600"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </g>
              <defs>
                <clipPath id="clip-kakao-guide">
                  <rect fill="white" height="18" width="18" />
                </clipPath>
              </defs>
            </svg>
            <p className="font-['Pretendard'] font-bold text-[#181600] text-[14px] whitespace-nowrap">
              카카오톡으로 보내기
            </p>
          </button>
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