import svgPaths from "./svg-77kkukwlrq";
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

function BrandGroup() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="brand-group">
      <div className="h-[48px] relative shrink-0 w-[60px]" data-name="image 7">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[201.26%] left-[-23.78%] max-w-none top-[-47.41%] w-[242.99%]" src={imgImage7} />
        </div>
      </div>
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">닿음</p>
    </div>
  );
}

function HeaderLeft() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="header-left">
      <BrandGroup />
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

function IconMenu() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[24px]" data-name="icon-menu">
      <Menu />
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white content-stretch flex h-[56px] items-center justify-between px-[24px] relative shrink-0 w-full" data-name="header">
      <HeaderLeft />
      <IconMenu />
    </div>
  );
}

function FileX() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="file-x">
      <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
        <g id="file-x">
          <path d={svgPaths.p311ec080} id="Vector" stroke="#DC2626" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg() {
  return (
    <div className="bg-[#fef2f2] content-stretch flex flex-col items-center justify-center relative rounded-[32px] shrink-0 size-[64px]" data-name="icon-bg">
      <FileX />
    </div>
  );
}

function ErrorIllustration() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative rounded-[60px] shrink-0 size-[120px]" data-name="error-illustration">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[60px]" />
      <IconBg />
    </div>
  );
}

function TitleBlock() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center not-italic relative shrink-0 text-center w-full" data-name="title-block">
      <p className="font-['Pretendard:Bold',sans-serif] leading-[normal] relative shrink-0 text-[#1b3a5c] text-[22px] whitespace-nowrap">분석에 실패했어요</p>
      <p className="font-['Pretendard:Regular',sans-serif] leading-[1.4] min-w-full relative shrink-0 text-[#64748b] text-[14px] w-[min-content]">이미지를 인식하지 못했거나 일시적인 오류가 발생했어요</p>
    </div>
  );
}

function Bullet() {
  return <div className="bg-[#dc2626] relative rounded-[3px] shrink-0 size-[6px]" data-name="bullet" />;
}

function ReasonItem() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="reason-item-0">
      <Bullet />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-w-px not-italic relative text-[#1b3a5c] text-[13px]">이미지가 흐리거나 잘린 경우</p>
    </div>
  );
}

function Bullet1() {
  return <div className="bg-[#dc2626] relative rounded-[3px] shrink-0 size-[6px]" data-name="bullet" />;
}

function ReasonItem1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="reason-item-1">
      <Bullet1 />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-w-px not-italic relative text-[#1b3a5c] text-[13px]">텍스트가 포함되지 않은 이미지</p>
    </div>
  );
}

function Bullet2() {
  return <div className="bg-[#dc2626] relative rounded-[3px] shrink-0 size-[6px]" data-name="bullet" />;
}

function ReasonItem2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="reason-item-2">
      <Bullet2 />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-w-px not-italic relative text-[#1b3a5c] text-[13px]">서버 연결이 불안정한 경우</p>
    </div>
  );
}

function ReasonsCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[14px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="reasons-card">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">이런 경우일 수 있어요</p>
      <ReasonItem />
      <ReasonItem1 />
      <ReasonItem2 />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center p-[24px] relative shrink-0 w-full" data-name="content">
      <ErrorIllustration />
      <TitleBlock />
      <ReasonsCard />
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

function BtnRetry() {
  return (
    <div className="bg-[#2563eb] content-stretch flex h-[54px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-retry">
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">다시 분석하기</p>
    </div>
  );
}

function BtnSelectOther() {
  return (
    <div className="bg-white content-stretch flex h-[50px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-select-other">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[14px] whitespace-nowrap">다른 이미지 선택</p>
    </div>
  );
}

function ActionGroup() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="action-group">
      <BtnRetry />
      <BtnSelectOther />
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
      <ActionGroup />
      <HomeIndicatorContainer />
    </div>
  );
}

export default function AnalysisFailedScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="analysis-failed-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}