import imgLoginLogo from "@/imports/image-4.png"
import svgLogin from "@/svg-rir42c0v4g"

interface LoginScreenProps {
  onKakaoLogin: () => void
  onShowTerms: () => void
  onShowPrivacy: () => void
}

function LoginStatusBar() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <p className="font-['Pretendard'] font-semibold leading-[normal] relative shrink-0 text-[#0f172a] text-[15px] whitespace-nowrap">9:41</p>
      <div className="flex gap-[6px] items-center">
        <div className="relative shrink-0 size-[18px]"><svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18"><path clipRule="evenodd" d={svgLogin.pc062070} fill="#0F172A" fillRule="evenodd" /></svg></div>
        <div className="relative shrink-0 size-[18px]"><svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18"><path clipRule="evenodd" d={svgLogin.p23837e00} fill="#0F172A" fillRule="evenodd" /></svg></div>
        <div className="h-[18px] relative shrink-0 w-[26px]"><svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 26 18"><path d={svgLogin.p1f206500} fill="#0F172A" /></svg></div>
      </div>
    </div>
  )
}

function HomeIndicator() {
  return <div className="flex items-start justify-center py-[12px] w-full"><div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" /></div>
}

export function LoginScreen({ onKakaoLogin, onShowTerms, onShowPrivacy }: LoginScreenProps) {
  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full h-full min-h-0">
      <div className="flex flex-col items-start w-full">
        <LoginStatusBar />
        <div className="flex flex-col gap-[48px] items-center pb-[40px] pt-[80px] px-[24px] w-full">
          <div className="h-[100px] relative shrink-0 w-[100px]"><img alt="닿음 로고" className="w-full h-full object-contain" src={imgLoginLogo} /></div>
          <div className="flex flex-col items-center gap-[8px]">
            <p className="font-['Pretendard'] font-extrabold leading-[normal] shrink-0 text-[#1b3a5c] text-[32px] whitespace-nowrap">닿음</p>
            <p className="font-['Pretendard'] font-semibold leading-[normal] shrink-0 text-[#64748b] text-[16px] text-center whitespace-nowrap">부모님의 안전한 디지털 생활을 도와드려요</p>
          </div>
          <div className="font-['Pretendard'] font-normal min-w-full shrink-0 text-[#64748b] text-[13px] text-center">
            <p className="leading-[1.5] mb-0">의심스러운 앱 목록을 보내주시면</p>
            <p className="leading-[1.5]">AI가 위험 여부를 분석해드립니다</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[12px] pb-[8px] px-[24px] w-full">
        <div className="flex flex-col gap-[16px] w-full">
          <button onClick={onKakaoLogin} className="bg-[#fee500] flex gap-[10px] h-[54px] items-center justify-center px-[16px] relative rounded-[14px] w-full cursor-pointer hover:bg-[#fdd835] transition-all">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[20px]" fill="none"><path d="M12 4C6.96 4 3 7.14 3 11c0 2.49 1.65 4.67 4.13 5.91L6.2 20.4a.45.45 0 0 0 .68.5l4.08-2.72c.34.03.69.04 1.04.04 5.04 0 9-3.14 9-7.22S17.04 4 12 4Z" fill="#181600" /></svg>
            <p className="font-['Pretendard'] font-bold leading-[normal] shrink-0 text-[#181600] text-[16px] whitespace-nowrap">카카오로 시작하기</p>
          </button>
          <p className="font-['Inter'] font-normal leading-[normal] shrink-0 text-[#64748b] text-[11px] text-center w-full">
            <span>계속하면 </span><button onClick={onShowTerms} className="underline decoration-solid cursor-pointer text-[#64748b]">이용약관</button><span> 및 </span><button onClick={onShowPrivacy} className="underline decoration-solid cursor-pointer text-[#64748b]">개인정보처리방침</button><span>에 동의하는 것으로 간주합니다.</span>
          </p>
        </div>
        <HomeIndicator />
      </div>
    </div>
  )
}
