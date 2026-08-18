import svgPaths from "./svg-rir42c0v4g";
import imgImage7 from "./83bf8d0b75621b51be8eff096fa935cde94ade91.png";

function IosSignal() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="ios-signal">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="ios-signal">
          <path clipRule="evenodd" d={svgPaths.pc062070} fill="#0F172A" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IosWifiSignal() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="ios-wifi-signal">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="ios-wifi-signal">
          <path clipRule="evenodd" d={svgPaths.p23837e00} fill="#0F172A" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IosBatteryFull() {
  return (
    <div className="h-[18px] relative shrink-0 w-[26px]" data-name="ios-battery-full">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 26 18" width="26">
        <g id="ios-battery-full">
          <path d={svgPaths.p1f206500} fill="#0F172A" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function StatusIcons() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="status-icons">
      <IosSignal />
      <IosWifiSignal />
      <IosBatteryFull />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between px-[24px] relative shrink-0 w-full" data-name="status-bar">
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0f172a] text-[15px] whitespace-nowrap">9:41</p>
      <StatusIcons />
    </div>
  );
}

function Titles() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center leading-[normal] not-italic relative shrink-0 whitespace-nowrap" data-name="titles">
      <p className="font-['Pretendard:ExtraBold',sans-serif] relative shrink-0 text-[#1b3a5c] text-[32px]">닿음</p>
      <p className="font-['Pretendard:SemiBold',sans-serif] relative shrink-0 text-[#64748b] text-[16px] text-center">부모님의 안전한 디지털 생활을 도와드려요</p>
    </div>
  );
}

function LogoBlock() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="logo-block">
      <Titles />
    </div>
  );
}

function LoginContent() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-center pb-[40px] pt-[80px] px-[24px] relative shrink-0 w-full" data-name="login-content">
      <div className="h-[110px] relative shrink-0 w-[137px]" data-name="image 7">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[201.26%] left-[-23.78%] max-w-none top-[-47.41%] w-[242.99%]" src={imgImage7} />
        </div>
      </div>
      <LogoBlock />
      <div className="[word-break:break-word] font-['Pretendard:Regular',sans-serif] leading-[0] min-w-full not-italic relative shrink-0 text-[#64748b] text-[13px] text-center w-[min-content]">
        <p className="leading-[1.5] mb-0">의심스러운 앱 목록을 보내주시면</p>
        <p className="leading-[1.5]">AI가 위험 여부를 분석해드립니다</p>
      </div>
    </div>
  );
}

function ScreenBody() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="screen-body">
      <StatusBar />
      <LoginContent />
    </div>
  );
}

function CircleX() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="circle-x">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g clipPath="url(#clip0_0_6)" id="circle-x">
          <path d={svgPaths.p2fb39800} id="Vector" stroke="black" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_6">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function BtnGoogleLogin() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_1px_1px_rgba(15,23,42,0.03)] flex gap-[12px] h-[54px] items-center justify-center p-[16px] relative rounded-[14px] shrink-0 w-full" data-name="btn-google-login">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CircleX />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0f172a] text-[16px] whitespace-nowrap">카카오톡으로 계속하기</p>
    </div>
  );
}

function LoginActions() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="login-actions">
      <BtnGoogleLogin />
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#64748b] text-[11px] text-center w-full">
        <span className="leading-[normal]">{`계속하면 `}</span>
        <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid leading-[normal] underline">이용약관</span>
        <span className="leading-[normal]">{` 및 `}</span>
        <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid leading-[normal] underline">개인정보처리방침</span>
        <span className="leading-[normal]">에 동의하는 것으로 간주합니다.</span>
      </p>
    </div>
  );
}

function HomeIndicatorContainer() {
  return (
    <div className="content-stretch flex items-start justify-center py-[12px] relative shrink-0 w-full" data-name="home-indicator-container">
      <div className="bg-[#0f172a] h-[5px] relative rounded-[100px] shrink-0 w-[134px]" data-name="home-indicator" />
    </div>
  );
}

function BottomArea() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start pb-[8px] px-[24px] relative shrink-0 w-full" data-name="bottom-area">
      <LoginActions />
      <HomeIndicatorContainer />
    </div>
  );
}

export default function LoginScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="login-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}