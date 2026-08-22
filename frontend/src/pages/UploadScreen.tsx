import { useState, useEffect, useRef, useCallback } from "react"
import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"
import imgHeaderLogo from "@/imports/image-4.png"

interface UploadScreenProps {
  initialAppName: string
  initialImageUrl: string | null
  focusAppName: boolean
  onAnalyze: (name: string, imageUrl: string | null) => void
  onMenuOpen: () => void
  onLogoClick: () => void
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

export function UploadScreen({
  initialAppName,
  initialImageUrl,
  focusAppName,
  onAnalyze,
  onMenuOpen,
  onLogoClick,
}: UploadScreenProps) {
  const [appName, setAppName] = useState(initialAppName)
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const appNameInputRef = useRef<HTMLInputElement>(null)

  const hasInput = appName.trim() || imageUrl

  useEffect(() => {
    if (focusAppName) {
      const t = setTimeout(() => appNameInputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setError("")
    if (!appName.trim()) setAppName("가짜은행 보안앱")
  }

  const handleAppNameChange = (val: string) => {
    setAppName(val)
    if (val.trim()) setError("")
  }

  const handleDeleteImage = () => {
    setImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const submit = useCallback(() => {
    if (!appName.trim() && !imageUrl) {
      setError("앱 이름을 입력하거나 이미지를 선택해주세요")
      return
    }
    setError("")
    onAnalyze(appName.trim() || "알 수 없는 앱", imageUrl)
  }, [appName, imageUrl, onAnalyze])

  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full min-h-full">
      <div className="flex-1 min-h-0 flex flex-col items-start w-full overflow-y-auto">
        <BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onLogoClick} />
        <div className="flex flex-col gap-[20px] px-4 py-6 min-[390px]:px-6 w-full">
          <div className="flex flex-col gap-[8px] w-full">
            <p className="font-['Pretendard'] font-bold leading-[1.4] text-[#1b3a5c] text-[22px] w-full">
              부모님 폰의 앱 목록 화면을 보내주세요
            </p>
            <p className="font-['Pretendard'] font-normal leading-[1.4] text-[#64748b] text-[14px] w-full">
              부모님의 앱 설치 화면 등을 촬영하거나 선택해주세요
            </p>
          </div>

          {error && (
            <div className="bg-[#fff1f1] flex gap-[8px] items-center px-[14px] py-[10px] rounded-[10px] w-full">
              <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#FF5C5C"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 5v3.5M8 10.5v.5"
                  stroke="#FF5C5C"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
              <p className="font-['Pretendard'] font-medium text-[#FF5C5C] text-[13px] leading-[normal]">
                {error}
              </p>
            </div>
          )}

          {imageUrl ? (
            <div
              className="relative rounded-[16px] w-full overflow-hidden shrink-0"
              style={{ height: 200 }}
            >
              <img
                src={imageUrl}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 flex items-end p-[10px] gap-[8px]"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))",
                }}
              >
                <button
                  onClick={handleDeleteImage}
                  className="bg-white flex-1 flex items-center justify-center gap-[5px] h-[34px] rounded-[8px]"
                >
                  <svg fill="none" height="12" viewBox="0 0 12 12" width="12">
                    <path
                      d="M2 2l8 8M10 2l-8 8"
                      stroke="#FF5C5C"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <p className="font-['Pretendard'] font-semibold text-[#FF5C5C] text-[12px]">
                    삭제
                  </p>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white flex-1 flex items-center justify-center h-[34px] rounded-[8px]"
                >
                  <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[12px]">
                    다시 선택
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white flex flex-col gap-[16px] h-[200px] items-center justify-center p-[24px] relative rounded-[16px] shrink-0 w-full">
              <div
                aria-hidden
                className="absolute border-2 border-[#e2e8f0] border-dashed inset-0 pointer-events-none rounded-[16px]"
              />
              <div className="bg-[#ebf0ff] flex items-center justify-center rounded-[24px] shrink-0 size-[48px]">
                <svg
                  className="block size-[24px]"
                  fill="none"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path
                    d={svgUpload.p17b66980}
                    stroke="#4F8CFF"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <p className="font-['Pretendard'] font-semibold text-[#64748b] text-[14px] text-center whitespace-nowrap">
                이미지를 선택하거나 촬영해주세요
              </p>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-2 min-[390px]:gap-3 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white flex flex-1 gap-[8px] h-[48px] items-center justify-center min-w-px relative rounded-[12px]"
            >
              <div
                aria-hidden
                className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
              />
              <svg
                className="block size-[18px]"
                fill="none"
                height="18"
                viewBox="0 0 18 18"
                width="18"
              >
                <path
                  d={svgUpload.p16e68700}
                  stroke="#1B3A5C"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
              <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px] whitespace-nowrap">
                갤러리에서 선택
              </p>
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="bg-white flex flex-1 gap-[8px] h-[48px] items-center justify-center min-w-px relative rounded-[12px]"
            >
              <div
                aria-hidden
                className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
              />
              <svg
                className="block size-[18px]"
                fill="none"
                height="18"
                viewBox="0 0 18 18"
                width="18"
              >
                <path
                  d={svgUpload.p31882300}
                  stroke="#1B3A5C"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
              <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px] whitespace-nowrap">
                카메라로 촬영
              </p>
            </button>
          </div>

          <div className="flex gap-[12px] items-center w-full">
            <div className="bg-[#e2e8f0] flex-1 h-px min-w-px" />
            <p className="font-['Inter'] font-semibold text-[#64748b] text-[12px] whitespace-nowrap">
              or
            </p>
            <div className="bg-[#e2e8f0] flex-1 h-px min-w-px" />
          </div>

          <div className="flex flex-col gap-[12px] w-full">
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px] whitespace-nowrap">
              앱 이름 직접 입력
            </p>
            <div className="bg-white flex h-[48px] items-center px-[16px] relative rounded-[12px] w-full">
              <div
                aria-hidden
                className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
              />
              <input
                ref={appNameInputRef}
                type="text"
                value={appName}
                onChange={(e) => handleAppNameChange(e.target.value)}
                placeholder="앱 이름을 입력하세요"
                className="flex-1 font-['Pretendard'] font-normal bg-transparent outline-none text-[#0f172a] text-[14px] placeholder-[#94a3b8] min-w-0"
              />
              {appName && (
                <button
                  onClick={() => handleAppNameChange("")}
                  className="ml-2 shrink-0"
                >
                  <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
                    <circle cx="8" cy="8" r="7.5" fill="#E2E8F0" />
                    <path
                      d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                      stroke="#94A3B8"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={submit}
              className={`flex h-[48px] items-center justify-center rounded-[12px] w-full transition-colors ${
                hasInput ? "bg-[#4F8CFF]" : "bg-[#b8c8e8]"
              }`}
            >
              <p className="font-['Pretendard'] font-bold leading-[normal] text-[16px] text-white">
                분석하기
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col pb-[8px] px-[24px] shrink-0 w-full">
        <HomeIndicator />
      </div>
    </div>
  )
}