import svgPaths from "./svg-drav9lc1n";
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
          <path clipRule="evenodd" d={svgPaths.p3b876d80} fill="#0F172A" fillRule="evenodd" id="Vector" />
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
          <path d={svgPaths.p26be2980} fill="#0F172A" id="Vector" />
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

function HeaderLeft() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="header-left">
      <div className="h-[48px] relative shrink-0 w-[60px]" data-name="image 7">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[201.26%] left-[-23.78%] max-w-none top-[-47.41%] w-[242.99%]" src={imgImage7} />
        </div>
      </div>
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">닿음</p>
    </div>
  );
}

function Menu() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="menu">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="menu">
          <path d={svgPaths.p15b88b00} id="Vector" stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconMenuHamburger() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[24px]" data-name="icon-menu hamburger">
      <Menu />
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white content-stretch flex h-[56px] items-center justify-between px-[24px] relative shrink-0 w-full" data-name="header">
      <HeaderLeft />
      <IconMenuHamburger />
    </div>
  );
}

function CircleX() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="circle-x">
      <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
        <g id="circle-x">
          <path d={svgPaths.p12c4d700} id="Vector" stroke="#2563EB" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconShieldLockSecurityProtectSecure() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[32px]" data-name="icon-shield lock security protect secure">
      <CircleX />
    </div>
  );
}

function InnerRing() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative rounded-[35px] shrink-0 size-[70px]" data-name="inner-ring">
      <IconShieldLockSecurityProtectSecure />
    </div>
  );
}

function LoadingCircle() {
  return (
    <div className="bg-[#eef2ff] content-stretch flex flex-col items-center justify-center relative rounded-[50px] shrink-0 size-[100px]" data-name="loading-circle">
      <InnerRing />
    </div>
  );
}

function TextIndicators() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center leading-[normal] not-italic relative shrink-0 whitespace-nowrap" data-name="text-indicators">
      <p className="font-['Pretendard:Bold',sans-serif] relative shrink-0 text-[#1b3a5c] text-[18px]">AI가 화면을 분석하고 있어요</p>
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#64748b] text-[13px]">인식된 앱 이름을 보안 데이터와 비교하고 있어요...</p>
    </div>
  );
}

function LoadingGraphicGroup() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center pt-[40px] relative shrink-0 w-full" data-name="loading-graphic-group">
      <LoadingCircle />
      <TextIndicators />
    </div>
  );
}

function LightbulbOff() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="lightbulb-off">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g clipPath="url(#clip0_0_4)" id="lightbulb-off">
          <path d={svgPaths.p7fe3a00} id="Vector" stroke="#2563EB" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_4">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconLightbulbIdeaSpark() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="icon-lightbulb idea spark">
      <LightbulbOff />
    </div>
  );
}

function TipHeader() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="tip-header">
      <IconLightbulbIdeaSpark />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#2563eb] text-[14px] whitespace-nowrap">알고 계셨나요?</p>
    </div>
  );
}

function TipCard() {
  return (
    <div className="bg-[#eef2ff] content-stretch flex flex-col gap-[12px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="tip-card">
      <TipHeader />
      <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] w-full">경찰청, 검찰청, 금융감독원 등 공공기관은 절대로 전화나 문자로 보안 앱 설치를 요구하지 않습니다.</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] h-[405px] items-center p-[24px] relative shrink-0 w-full" data-name="content">
      <LoadingGraphicGroup />
      <TipCard />
    </div>
  );
}

function ScreenBody() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="screen-body">
      <StatusBar />
      <Header />
      <Content />
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
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="bottom-area">
      <HomeIndicatorContainer />
    </div>
  );
}

export default function LoadingScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="loading-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}