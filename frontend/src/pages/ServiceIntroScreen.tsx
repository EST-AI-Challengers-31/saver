import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"
import imgHeaderLogo from "@/imports/image-4.png"

function StatusBar() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <p className="font-['Pretendard'] font-semibold leading-[normal] relative shrink-0 text-[#0f172a] text-[15px] whitespace-nowrap">9:41</p>
      <div className="flex gap-[6px] items-center">
        <div className="relative shrink-0 size-[18px]"><svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18"><path clipRule="evenodd" d={svgUpload.pc062070} fill="#0F172A" fillRule="evenodd" /></svg></div>
        <div className="relative shrink-0 size-[18px]"><svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18"><path clipRule="evenodd" d={svgUpload.p23837e00} fill="#0F172A" fillRule="evenodd" /></svg></div>
        <div className="h-[18px] relative shrink-0 w-[26px]"><svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 26 18"><path d={svgUpload.p1f206500} fill="#0F172A" /></svg></div>
      </div>
    </div>
  )
}

function BrandHeader({ onMenuOpen, onLogoClick }: { onMenuOpen: () => void; onLogoClick?: () => void }) {
  return (
    <div className="bg-white content-stretch flex h-[56px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <button onClick={onLogoClick} className="flex gap-[12px] items-center cursor-pointer">
        <div className="h-[36px] relative shrink-0 w-[36px]"><img alt="닿음 로고" className="w-full h-full object-contain" src={imgHeaderLogo} /></div>
        <p className="font-['Pretendard'] font-bold leading-[normal] shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">닿음</p>
      </button>
      <button onClick={onMenuOpen} className="flex flex-col items-center justify-center shrink-0 size-[24px] cursor-pointer">
        <svg className="block size-full" fill="none" height="24" viewBox="0 0 24 24" width="24"><path d={svgUpload.p15b88b00} stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" /></svg>
      </button>
    </div>
  )
}

function HomeIndicator() {
  return <div className="flex items-start justify-center py-[12px] w-full"><div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" /></div>
}

interface ServiceIntroScreenProps {
  onBack: () => void
  onMenuOpen: () => void
}

const steps = [
  {
    number: "01",
    title: "수집 · 의심 앱 정보 확인",
    desc: "스크린샷 OCR 또는 앱 이름·패키지명을 직접 입력해 분석 대상을 빠르게 수집합니다.",
    badge: "IMAGE / TEXT",
  },
  {
    number: "02",
    title: "판정 · Python 기준 분석",
    desc: "Exact Match는 HIGH, 유사도 임계값 이상은 MEDIUM, 근거가 부족하면 UNKNOWN으로 구분합니다.",
    badge: "HIGH · MEDIUM · UNKNOWN",
  },
  {
    number: "03",
    title: "행동 · 가족이 함께 대응",
    desc: "어려운 보안 용어를 쉬운 설명으로 바꾸고 부모님 안내문과 바로 할 행동을 제공합니다.",
    badge: "이해 → 판단 → 행동",
  },
]

export function ServiceIntroScreen({ onBack, onMenuOpen }: ServiceIntroScreenProps) {
  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full h-full overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto">
        <StatusBar />
        <BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onBack} />
        <div className="flex flex-col gap-[20px] px-4 py-6 min-[390px]:px-6 w-full">
          <div className="flex flex-col gap-[8px] w-full">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[20px]">닿음의 3단계 보안 흐름</p>
            <p className="font-['Pretendard'] font-normal text-[#64748b] text-[14px] leading-[1.55]">단순히 위험을 표시하는 데서 끝나지 않고, 가족이 근거를 이해하고 실제 행동까지 이어갈 수 있도록 설계했습니다.</p>
          </div>

          <div className="flex flex-col gap-[12px] w-full">
            {steps.map((step) => (
              <div key={step.number} className="bg-white flex gap-[14px] p-[16px] relative rounded-[18px] w-full">
                <div aria-hidden className="absolute border border-[#e8edf3] border-solid inset-0 pointer-events-none rounded-[18px]" />
                <div className="bg-[#eef4ff] flex items-center justify-center rounded-[13px] size-[42px] shrink-0">
                  <span className="font-['Pretendard'] font-extrabold text-[#4f8cff] text-[13px]">{step.number}</span>
                </div>
                <div className="flex flex-col gap-[6px] min-w-0">
                  <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px]">{step.title}</p>
                  <p className="font-['Pretendard'] font-normal text-[#64748b] text-[13px] leading-[1.45]">{step.desc}</p>
                  <div className="pt-[2px]"><span className="inline-flex bg-[#f8fafc] border border-[#e2e8f0] rounded-full px-[9px] py-[4px] font-['Pretendard'] font-semibold text-[#64748b] text-[10px]">{step.badge}</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1b3a5c] rounded-[18px] p-[18px] flex flex-col gap-[8px]">
            <p className="font-['Pretendard'] font-bold text-white text-[14px]">판정 원칙</p>
            <p className="font-['Pretendard'] text-[#dbe7f3] text-[12px] leading-[1.55]">UNKNOWN은 안전하다는 뜻이 아닙니다. 닿음은 확인 가능한 근거가 부족할 때 과도한 확신 대신 UNKNOWN으로 표시합니다.</p>
          </div>

          <button onClick={onBack} className="h-[52px] rounded-[14px] w-full font-['Pretendard'] font-bold text-white text-[15px]" style={{ background: "linear-gradient(90deg, #4F8CFF 0%, #7B6CFF 100%)" }}>앱 분석 시작하기</button>
        </div>
      </div>
      <div className="flex flex-col w-full bg-[#f8fafb] shrink-0"><HomeIndicator /></div>
    </div>
  )
}
