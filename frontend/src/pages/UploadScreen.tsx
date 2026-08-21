import { useState, useEffect, useRef, useCallback } from "react"
import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"
import imgHeaderLogo from "@/imports/image-4.png"

interface UploadScreenProps {
  initialAppName: string
  initialImageUrl: string | null
  focusAppName: boolean
  onAnalyze: (name: string, imageUrl: string | null, imageFile: File | null) => void
  onMenuOpen: () => void
  onLogoClick: () => void
}

function BrandHeader({ onMenuOpen, onLogoClick }: { onMenuOpen: () => void; onLogoClick?: () => void }) {
  return <div className="bg-white content-stretch flex h-[56px] items-center justify-between px-[24px] relative shrink-0 w-full"><button onClick={onLogoClick} className="flex gap-[12px] items-center"><div className="h-[36px] relative shrink-0 w-[36px]"><img alt="닿음 로고" className="w-full h-full object-contain" src={imgHeaderLogo} /></div><p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">닿음</p></button><button onClick={onMenuOpen} className="flex flex-col items-center justify-center shrink-0 size-[24px]"><svg className="block size-full" fill="none" viewBox="0 0 24 24"><path d={svgUpload.p15b88b00} stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" /></svg></button></div>
}
function HomeIndicator() { return <div className="flex items-start justify-center py-[12px] w-full"><div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" /></div> }

export function UploadScreen({ initialAppName, initialImageUrl, focusAppName, onAnalyze, onMenuOpen, onLogoClick }: UploadScreenProps) {
  const [appName, setAppName] = useState(initialAppName)
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const appNameInputRef = useRef<HTMLInputElement>(null)
  const hasInput = Boolean(appName.trim() || imageUrl)

  useEffect(() => { if (!focusAppName) return; const timer = setTimeout(() => appNameInputRef.current?.focus(), 80); return () => clearTimeout(timer) }, [focusAppName])
  useEffect(() => () => { if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl) }, [imageUrl])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return
    if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl)
    setSelectedFile(file); setImageUrl(URL.createObjectURL(file)); setError("")
  }
  const handleDeleteImage = () => {
    if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl)
    setSelectedFile(null); setImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }
  const submit = useCallback(() => {
    if (!appName.trim() && !selectedFile) { setError("앱 이름 또는 패키지명을 입력하거나 이미지를 선택해주세요"); return }
    setError(""); onAnalyze(appName.trim() || "이미지 OCR 분석", imageUrl, selectedFile)
  }, [appName, imageUrl, selectedFile, onAnalyze])

  return <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full min-h-full"><div className="flex-1 min-h-0 flex flex-col items-start w-full overflow-y-auto"><BrandHeader onMenuOpen={onMenuOpen} onLogoClick={onLogoClick} /><div className="flex flex-col gap-[20px] px-4 py-6 min-[390px]:px-6 w-full"><div className="flex flex-col gap-[8px]"><p className="font-['Pretendard'] font-bold leading-[1.4] text-[#1b3a5c] text-[22px]">부모님 폰의 앱 목록 화면을 보내주세요</p><p className="font-['Pretendard'] text-[#64748b] text-[14px]">부모님의 앱 설치 화면 등을 촬영하거나 선택해주세요</p></div>{error && <div className="bg-[#fff1f1] px-[14px] py-[10px] rounded-[10px]"><p className="font-['Pretendard'] font-medium text-[#FF5C5C] text-[13px]">{error}</p></div>}{imageUrl ? <div className="relative rounded-[16px] w-full overflow-hidden shrink-0" style={{ height: 200 }}><img src={imageUrl} alt="미리보기" className="w-full h-full object-cover" /><div className="absolute inset-0 flex items-end p-[10px] gap-[8px]" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))" }}><button onClick={handleDeleteImage} className="bg-white flex-1 h-[34px] rounded-[8px] font-['Pretendard'] font-semibold text-[#FF5C5C] text-[12px]">삭제</button><button onClick={() => fileInputRef.current?.click()} className="bg-white flex-1 h-[34px] rounded-[8px] font-['Pretendard'] font-semibold text-[#1b3a5c] text-[12px]">다시 선택</button></div></div> : <div className="bg-white flex flex-col gap-[16px] h-[200px] items-center justify-center p-[24px] relative rounded-[16px]"><div aria-hidden className="absolute border-2 border-[#e2e8f0] border-dashed inset-0 rounded-[16px]" /><div className="bg-[#ebf0ff] flex items-center justify-center rounded-[24px] size-[48px]"><svg className="size-[24px]" fill="none" viewBox="0 0 24 24"><path d={svgUpload.p17b66980} stroke="#4F8CFF" strokeLinecap="round" strokeWidth="2" /></svg></div><p className="font-['Pretendard'] font-semibold text-[#64748b] text-[14px]">이미지를 선택하거나 촬영해주세요</p></div>}<input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" /><input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" /><div className="flex gap-2 min-[390px]:gap-3"><button onClick={() => fileInputRef.current?.click()} className="bg-white flex-1 h-[48px] rounded-[12px] border border-[#e2e8f0] font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px]">갤러리에서 선택</button><button onClick={() => cameraInputRef.current?.click()} className="bg-white flex-1 h-[48px] rounded-[12px] border border-[#e2e8f0] font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px]">카메라로 촬영</button></div><div className="flex gap-[12px] items-center"><div className="bg-[#e2e8f0] flex-1 h-px" /><p className="font-['Inter'] font-semibold text-[#64748b] text-[12px]">or</p><div className="bg-[#e2e8f0] flex-1 h-px" /></div><div className="flex flex-col gap-[12px]"><p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px]">앱 이름 또는 패키지명 직접 입력</p><div className="bg-white flex h-[48px] items-center px-[16px] relative rounded-[12px] border border-[#e2e8f0]"><input ref={appNameInputRef} type="text" value={appName} onChange={(e) => { setAppName(e.target.value); if (e.target.value.trim()) setError("") }} placeholder="예: bin.mt.plus 또는 앱 이름" className="flex-1 font-['Pretendard'] bg-transparent outline-none text-[#0f172a] text-[14px] placeholder-[#94a3b8] min-w-0" /></div><button onClick={submit} className={`flex h-[48px] items-center justify-center rounded-[12px] transition-colors ${hasInput ? "bg-[#4F8CFF]" : "bg-[#b8c8e8]"}`}><p className="font-['Pretendard'] font-bold text-[16px] text-white">분석하기</p></button></div></div></div><div className="pb-[8px] px-[24px]"><HomeIndicator /></div></div>
}
