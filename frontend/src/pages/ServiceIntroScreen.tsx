import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"
import imgHeaderLogo from "@/imports/image-4.png"

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

interface ServiceIntroScreenProps {
  onBack: () => void
  onMenuOpen: () => void
}

export function ServiceIntroScreen({
  onBack,
  onMenuOpen,
}: ServiceIntroScreenProps) {
  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full h-full overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto">
        <StatusBar />
        <BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onBack} />
        <div className="flex flex-col gap-[20px] px-4 py-6 min-[390px]:px-6 w-full">
          <div className="flex flex-col gap-[8px] w-full">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[20px]">
              보이스피싱 예방 플랫폼, 닿음
            </p>
            <p className="font-['Pretendard'] font-normal text-[#64748b] text-[14px] leading-[1.5]">
              부모님의 스마트폰을 위협하는 악성 앱과 보이스피싱 위험을 빠르고 정확하게 진단하고 안내합니다.
            </p>
          </div>
          <div className="flex flex-col gap-[12px] w-full">
            {[
              {
                title: "빠른 악성 앱 감지",
                desc: "스크린샷이나 앱 이름만으로 악성코드를 신속하게 판별합니다.",
              },
              {
                title: "부모님 안심 맞춤 안내문",
                desc: "어르신들도 쉽게 이해하실 수 있는 다정한 말투의 행동 가이드를 제공합니다.",
              },
              {
                title: "체계적인 상세 분석",
                desc: "알약 모바일 데이터 기반의 유사도 비교 및 권한 탈취 위험성을 분석합니다.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white flex flex-col gap-[6px] p-[16px] relative rounded-[16px] w-full">
                <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]" />
                <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px]">{item.title}</p>
                <p className="font-['Pretendard'] font-normal text-[#64748b] text-[13px] leading-[1.4]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full bg-[#f8fafb] shrink-0">
        <HomeIndicator />
      </div>
    </div>
  )
}