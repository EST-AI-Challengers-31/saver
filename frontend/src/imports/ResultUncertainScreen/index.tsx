import svgPaths from "./svg-2i0kf57mks";
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

function Pause() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="pause">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="pause">
          <g id="Vector">
            <path d={svgPaths.p26327d80} stroke="#6B7280" strokeLinecap="round" strokeWidth="2" />
            <path d={svgPaths.p35b50300} stroke="#6B7280" strokeLinecap="round" strokeWidth="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IconUncertain() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]" data-name="icon-uncertain">
      <Pause />
    </div>
  );
}

function BadgeUncertain() {
  return (
    <div className="bg-[#f3f4f6] content-stretch flex gap-[6px] items-center px-[16px] py-[8px] relative rounded-[100px] shrink-0" data-name="badge-uncertain">
      <div aria-hidden className="absolute border border-[#6b7280] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <IconUncertain />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">판단 보류</p>
    </div>
  );
}

function BadgeRow() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="badge-row">
      <BadgeUncertain />
    </div>
  );
}

function SummaryCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="summary-card">
      <div aria-hidden className="absolute border border-[#6b7280] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[0] not-italic relative shrink-0 text-[#1b3a5c] text-[20px] whitespace-nowrap">
        <p className="leading-[1.4] mb-0">AI가 판단하기 어려운</p>
        <p className="leading-[1.4]">앱이에요</p>
      </div>
      <p className="[word-break:break-word] font-['Pretendard:Regular',sans-serif] leading-[1.5] min-w-full not-italic relative shrink-0 text-[#64748b] text-[14px] w-[min-content]">이 화면만으로는 위험 여부를 판단하기 어렵습니다. 위험하다는 의미가 아니니 너무 걱정하지 마세요.</p>
    </div>
  );
}

function Bullet() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start not-italic relative shrink-0 w-full" data-name="bullet-1">
      <p className="font-['Pretendard:Regular',sans-serif] leading-[normal] relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">•</p>
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[1.4] min-w-px relative text-[#1b3a5c] text-[13px]">다른 화면도 함께 보내주시면 더 정확한 분석이 가능해요</p>
    </div>
  );
}

function Bullet1() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start not-italic relative shrink-0 w-full" data-name="bullet-2">
      <p className="font-['Pretendard:Regular',sans-serif] leading-[normal] relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">•</p>
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[1.4] min-w-px relative text-[#1b3a5c] text-[13px]">앱 이름을 다시 한 번 확인해주세요</p>
    </div>
  );
}

function SuggestionsCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[14px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="suggestions-card">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">추가로 해볼 수 있는 것</p>
      <Bullet />
      <Bullet1 />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start p-[24px] relative shrink-0 w-full" data-name="content">
      <BadgeRow />
      <SummaryCard />
      <SuggestionsCard />
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

function BtnReanalyze() {
  return (
    <div className="bg-white content-stretch flex h-[54px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-reanalyze">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[16px] whitespace-nowrap">다른 앱 분석하기</p>
    </div>
  );
}

function ActionGroup() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full" data-name="action-group">
      <BtnReanalyze />
      <p className="[text-underline-position:from-font] [word-break:break-word] decoration-from-font decoration-solid font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[14px] underline whitespace-nowrap">처음으로</p>
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

export default function ResultUncertainScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="result-uncertain-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}