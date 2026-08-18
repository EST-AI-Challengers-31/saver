import { useState, useEffect } from "react"
import svgLoading from "@/imports/LoadingScreen/svg-drav9lc1n"
import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"
import imgHeaderLogo from "@/imports/image-4.png"

interface LoadingScreenProps {
  onDone: () => void
  onMenuOpen: () => void
  onLogoClick: () => void
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

function HomeIndicator() {
  return (
    <div className="flex items-start justify-center py-[12px] w-full">
      <div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" />
    </div>
  )
}

export function LoadingScreen({
  onDone,
  onMenuOpen,
  onLogoClick,
}: LoadingScreenProps) {
  const [dots, setDots] = useState(1)
  const [phase, setPhase] = useState<"scanning" | "done">("scanning")

  useEffect(() => {
    const dotsTimer = setInterval(() => setDots((d) => (d % 3) + 1), 600)
    const phaseTimer = setTimeout(() => setPhase("done"), 2000)
    const doneTimer = setTimeout(onDone, 2750)
    return () => {
      clearInterval(dotsTimer)
      clearTimeout(phaseTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  const isDone = phase === "done"

  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full min-h-full">
      <div className="flex flex-col items-start w-full">
        <StatusBar />
        <BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onLogoClick} />
        <div className="flex flex-col gap-[32px] items-center p-[24px] w-full">
          <div className="flex flex-col gap-[24px] items-center pt-[40px] w-full">
            {/* Animated icon container */}
            <div className="relative flex items-center justify-center size-[116px]">
              {/* Spinning ring */}
              <div
                className="absolute inset-0 rounded-full border-[3px] animate-spin"
                style={{
                  borderColor: isDone ? "#a7f3d0" : "#c5d8ff",
                  borderTopColor: isDone ? "#059669" : "#4F8CFF",
                }}
              />
              {/* Inner circles */}
              <div
                className="flex items-center justify-center rounded-[50px] size-[100px] transition-colors duration-300"
                style={{ backgroundColor: isDone ? "#ecfdf5" : "#ebf0ff" }}
              >
                <div className="bg-white flex items-center justify-center rounded-[35px] size-[70px]">
                  {isDone ? (
                    <svg
                      className="block size-[32px]"
                      fill="none"
                      viewBox="0 0 32 32"
                    >
                      <circle
                        cx="16"
                        cy="16"
                        r="11"
                        stroke="#059669"
                        strokeWidth="2"
                      />
                      <path
                        d="M10.5 16l3.5 3.5 7.5-7.5"
                        stroke="#059669"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block size-[32px]"
                      fill="none"
                      viewBox="0 0 32 32"
                    >
                      <path
                        d="M16 3L5 7.5V15C5 20.8 9.8 26.2 16 28C22.2 26.2 27 20.8 27 15V7.5L16 3Z"
                        stroke="#4F8CFF"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <circle
                        cx="14.5"
                        cy="14.5"
                        r="3.5"
                        stroke="#4F8CFF"
                        strokeWidth="2"
                      />
                      <path
                        d="M17.2 17.2L20 20"
                        stroke="#4F8CFF"
                        strokeLinecap="round"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-[8px] items-center">
              {isDone ? (
                <>
                  <p className="font-['Pretendard'] font-bold text-[#059669] text-[18px] whitespace-nowrap">
                    분석이 완료되었어요!
                  </p>
                  <p className="font-['Pretendard'] font-normal text-[#64748b] text-[13px] whitespace-nowrap">
                    결과 화면으로 이동합니다
                  </p>
                </>
              ) : (
                <>
                  <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px] whitespace-nowrap">
                    AI가 화면을 분석하고 있어요
                  </p>
                  <p className="font-['Pretendard'] font-normal text-[#64748b] text-[13px] whitespace-nowrap">
                    {`인식된 앱 이름을 보안 데이터와 비교하고 있어요${"·".repeat(dots)}`}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Tip card */}
          <div
            className="flex flex-col gap-[12px] p-[20px] rounded-[16px] w-full"
            style={{
              background: "linear-gradient(135deg, #ebf0ff 0%, #ebe8ff 100%)",
            }}
          >
            <div className="flex gap-[8px] items-center w-full">
              <svg
                className="block size-[20px]"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
              >
                <g clipPath="url(#clip-tip)">
                  <path
                    d={svgLoading.p7fe3a00}
                    stroke="#7B6CFF"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </g>
                <defs>
                  <clipPath id="clip-tip">
                    <rect fill="white" height="20" width="20" />
                  </clipPath>
                </defs>
              </svg>
              <p
                className="font-['Pretendard'] font-bold text-[14px] whitespace-nowrap"
                style={{
                  background: "linear-gradient(90deg, #4F8CFF, #7B6CFF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                알고 계셨나요?
              </p>
            </div>
            <p className="font-['Pretendard'] font-medium leading-[1.5] text-[#1b3a5c] text-[14px] w-full">
              경찰청, 검찰청, 금융감독원 등 공공기관은 절대로 전화나 문자로 보안
              앱 설치를 요구하지 않습니다.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <HomeIndicator />
      </div>
    </div>
  )
}