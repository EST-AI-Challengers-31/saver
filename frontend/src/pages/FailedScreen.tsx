import svgFailed from "@/imports/ResultDangerScreen/svg-eijb8y654a"
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

function BrandHeader({
  onMenuOpen,
  onLogoClick,
}: {
  onMenuOpen: () => void
  onLogoClick?: () => void
}) {
  return (
    <div className="bg-white content-stretch flex h-[56px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <button
        onClick={onLogoClick}
        className="flex gap-[12px] items-center cursor-pointer"
      >
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
        className="flex flex-col items-center justify-center shrink-0 size-[24px] cursor-pointer"
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

function HomeIndicator() {
  return (
    <div className="flex items-start justify-center py-[12px] w-full">
      <div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" />
    </div>
  )
}

interface FailedScreenProps {
  onSelectImage: () => void
  onTypeAppName: () => void
  onMenuOpen: () => void
  onLogoClick: () => void
}

export function FailedScreen({
  onSelectImage,
  onTypeAppName,
  onMenuOpen,
  onLogoClick,
}: FailedScreenProps) {
  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full h-full overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto">
        <StatusBar />
        <BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onLogoClick} />
        <div className="flex flex-col items-center gap-[24px] px-[24px] py-[40px] text-center w-full my-auto">
          <div className="bg-[#fff1f1] flex items-center justify-center rounded-[32px] size-[80px]">
            <svg className="size-[40px]" fill="none" viewBox="0 0 20 20">
              <path
                d={svgFailed.p119e80b0}
                stroke="#FF5C5C"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-[8px] w-full">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[20px]">
              앱을 인식하지 못했어요
            </p>
            <p className="font-['Pretendard'] font-normal text-[#64748b] text-[14px] leading-[1.5]">
              업로드하신 이미지나 입력하신 내용에서 앱 정보를 찾지 못했습니다.
              <br />
              다시 시도해 주세요.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[12px] pb-[8px] px-[24px] shrink-0 w-full bg-[#f8fafb]">
        <div className="flex flex-col gap-[8px] w-full">
          <button
            onClick={onSelectImage}
            className="flex gap-[8px] h-[54px] items-center justify-center rounded-[14px] w-full cursor-pointer text-white font-['Pretendard'] font-bold text-[16px]"
            style={{
              background: "linear-gradient(90deg, #4F8CFF 0%, #7B6CFF 100%)",
            }}
          >
            이미지 다시 선택하기
          </button>
          <button
            onClick={onTypeAppName}
            className="bg-white flex h-[50px] items-center justify-center relative rounded-[14px] w-full cursor-pointer border border-[#e2e8f0]"
          >
            <p className="font-['Pretendard'] font-semibold text-[#64748b] text-[14px]">
              앱 이름 직접 입력하기
            </p>
          </button>
        </div>
        <HomeIndicator />
      </div>
    </div>
  )
}
