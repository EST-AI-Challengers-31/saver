import svgDanger from "@/imports/ResultDangerScreen/svg-eijb8y654a"
import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"
import imgHeaderLogo from "@/imports/image-4.png"

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
    cardBorder: "#FF5C5C",
    title: "이 앱은 보이스피싱일 가능성이 높아요",
    body: "여러 위험 신호가 감지되었습니다. 절대 개인정보를 입력하거나 앱을 설치하지 마세요.",
    barColor: "#FF5C5C",
    pctColor: "#FF5C5C",
    riskLabel: "위험 가능성",
    riskValue: "높음",
    riskColor: "#FF5C5C",
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
  },
}

function StatusBar() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <p className="font-['Pretendard'] font-semibold leading-[normal] relative shrink-0 text-[#0f172a] text-[15px] whitespace-nowrap">
        9:41
      </p>
      <div className="flex gap-[6px] items-center">
        <div className="relative shrink-0 size-[18px]">
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18">
            <path clipRule="evenodd" d={svgUpload.pc062070} fill="#0F172A" fillRule="evenodd" />
          </svg>
        </div>
        <div className="relative shrink-0 size-[18px]">
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18">
            <path clipRule="evenodd" d={svgUpload.p23837e00} fill="#0F172A" fillRule="evenodd" />
          </svg>
        </div>
        <div className="h-[18px] relative shrink-0 w-[26px]">
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 26 18">
            <path d={svgUpload.p1f206500} fill="#0F172A" />
          </svg>
        </div>
      </div>
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
      <button onClick={onLogoClick} className="flex gap-[12px] items-center cursor-pointer">
        <div className="h-[36px] relative shrink-0 w-[36px]">
          <img alt="닿음 로고" className="w-full h-full object-contain" src={imgHeaderLogo} />
        </div>
        <p className="font-['Pretendard'] font-bold leading-[normal] shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">
          닿음
        </p>
      </button>
      <button onClick={onMenuOpen} className="flex flex-col items-center justify-center shrink-0 size-[24px] cursor-pointer">
        <svg className="block size-full" fill="none" height="24" viewBox="0 0 24 24" width="24">
          <path d={svgUpload.p15b88b00} stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" />
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

interface ResultScreenProps {
  appName: string
  result: AnalysisResult
  onDetail: () => void
  onGuide: () => void
  onAnalyzeAnother: () => void
  onMenuOpen: () => void
  onLogoClick: () => void
}

export function ResultScreen({
  appName,
  result,
  onDetail,
  onGuide,
  onAnalyzeAnother,
  onMenuOpen,
  onLogoClick,
}: ResultScreenProps) {
  const v = VC[result.verdict]
  const isDanger = result.verdict === "danger"
  const isCaution = result.verdict === "caution"

  const BadgeIcon = () => {
    if (isDanger)
      return (
        <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
          <path d={svgDanger.p119e80b0} stroke={v.badgeText} strokeLinecap="round" strokeWidth="2" />
        </svg>
      )
    if (isCaution)
      return (
        <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
          <path d="M10 3.5L18.1 17H1.9L10 3.5Z" stroke={v.badgeText} strokeLinejoin="round" strokeWidth="2" />
          <path d="M10 9v3M10 13.5v.5" stroke={v.badgeText} strokeLinecap="round" strokeWidth="2" />
        </svg>
      )
    return (
      <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" stroke={v.badgeText} strokeWidth="2" />
        <path d="M10 7v4M10 13v.5" stroke={v.badgeText} strokeLinecap="round" strokeWidth="2" />
      </svg>
    )
  }

  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full h-full overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto">
        <StatusBar />
        <BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onLogoClick} />
        <div className="flex flex-col gap-[20px] px-4 py-6 min-[390px]:px-6 w-full">
          <div className="flex justify-center w-full">
            <div
              className="flex gap-[8px] items-center px-[16px] py-[10px] rounded-[100px]"
              style={{ backgroundColor: v.badgeBg, border: `1px solid ${v.badgeBorder}` }}
            >
              <BadgeIcon />
              <p className="font-['Pretendard'] font-bold text-[14px] whitespace-nowrap" style={{ color: v.badgeText }}>
                {v.badgeLabel}
              </p>
            </div>
          </div>
          <div className="bg-white flex flex-col gap-[16px] p-[24px] relative rounded-[20px] w-full">
            <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[20px]" style={{ border: `1px solid ${v.cardBorder}` }} />
            <p className="font-['Pretendard'] font-bold leading-[1.4] text-[#1b3a5c] text-[20px] w-full">{v.title}</p>
            <p className="font-['Pretendard'] font-medium leading-[1.5] text-[#64748b] text-[14px] w-full">{v.body}</p>
            <div className="flex flex-col gap-[6px] pt-[12px] w-full">
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter'] font-normal text-[#64748b] text-[12px]">악성 앱 유사도</p>
                <p className="font-['Pretendard'] font-bold text-[12px]" style={{ color: v.pctColor }}>{result.similarity}%</p>
              </div>
              <div className="bg-[#e2e8f0] h-[8px] overflow-clip rounded-[4px] w-full">
                <div className="h-full rounded-[4px]" style={{ width: `${result.similarity}%`, backgroundColor: v.barColor }} />
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col gap-[14px] p-[20px] relative rounded-[16px] w-full">
            <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]" />
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px] whitespace-nowrap">분석된 앱 정보</p>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px]">앱 이름: {appName}</p>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[13px]">유사 악성 앱: {result.similarCount}건</p>
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[13px]">분석 기준: 알약 모바일 악성코드 탐지 데이터</p>
          </div>
          <div className="bg-white flex flex-col gap-[6px] p-[16px] relative rounded-[16px] w-full">
            <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]" />
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px] whitespace-nowrap">{v.riskLabel}</p>
            <p className="font-['Pretendard'] font-semibold text-[13px]" style={{ color: v.riskColor }}>{v.riskValue}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[12px] pb-[8px] px-[24px] shrink-0 w-full bg-[#f8fafb]">
        <div className="flex flex-col gap-[8px] w-full">
          <button
            onClick={onGuide}
            className="flex gap-[8px] h-[54px] items-center justify-center rounded-[14px] w-full cursor-pointer"
            style={{ background: "linear-gradient(90deg, #4F8CFF 0%, #7B6CFF 100%)" }}
          >
            <svg className="block size-[18px]" fill="none" height="18" viewBox="0 0 18 18" width="18">
              <g clipPath="url(#clip-send)">
                <path d={svgDanger.p3df57c00} stroke="white" strokeLinecap="round" strokeWidth="2" />
              </g>
              <defs>
                <clipPath id="clip-send">
                  <rect fill="white" height="18" width="18" />
                </clipPath>
              </defs>
            </svg>
            <p className="font-['Pretendard'] font-bold text-[16px] text-white whitespace-nowrap">부모님께 안내문 보내기</p>
          </button>
          {!result.verdict.includes("uncertain") && (
            <button onClick={onDetail} className="bg-white flex h-[50px] items-center justify-center relative rounded-[14px] w-full cursor-pointer">
              <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
              <p className="font-['Pretendard'] font-semibold text-[#64748b] text-[14px] whitespace-nowrap">상세 정보 보기</p>
            </button>
          )}
          <button onClick={onAnalyzeAnother} className="bg-white flex h-[42px] items-center justify-center relative rounded-[12px] w-full cursor-pointer">
            <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]" />
            <p className="font-['Pretendard'] font-medium text-[#64748b] text-[13px] whitespace-nowrap">다른 앱 분석하기</p>
          </button>
        </div>
        <HomeIndicator />
      </div>
    </div>
  )
}