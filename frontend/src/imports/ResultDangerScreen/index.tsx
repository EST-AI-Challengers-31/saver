import svgPaths from "./svg-eijb8y654a";
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

function AlertTriangle() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="alert-triangle">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="alert-triangle">
          <path d={svgPaths.p119e80b0} id="Vector" stroke="#DC2626" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconDangerWarningAlertError() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="icon-danger warning alert error">
      <AlertTriangle />
    </div>
  );
}

function BadgeDanger() {
  return (
    <div className="bg-[#fef2f2] content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-name="badge-danger">
      <div aria-hidden className="absolute border border-[#dc2626] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <IconDangerWarningAlertError />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#dc2626] text-[14px] whitespace-nowrap">위험 수준 매우 높음</p>
    </div>
  );
}

function DangerBadgeRow() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="danger-badge-row">
      <BadgeDanger />
    </div>
  );
}

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] not-italic relative shrink-0 text-[12px] w-full whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal relative shrink-0 text-[#64748b]">악성 앱 유사도</p>
      <p className="font-['Pretendard:Bold',sans-serif] relative shrink-0 text-[#dc2626]">94%</p>
    </div>
  );
}

function Track() {
  return (
    <div className="bg-[#e2e8f0] content-stretch flex h-[8px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-name="track">
      <div className="bg-[#dc2626] h-full relative shrink-0 w-[300px]" data-name="fill-danger" />
    </div>
  );
}

function RiskBarContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start pt-[12px] relative shrink-0 w-full" data-name="risk-bar-container">
      <Frame />
      <Track />
    </div>
  );
}

function SummaryCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full" data-name="summary-card">
      <div aria-hidden className="absolute border border-[#dc2626] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#1b3a5c] text-[20px] w-full">이 앱은 보이스피싱일 가능성이 높아요</p>
      <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#64748b] text-[14px] w-full">여러 위험 신호가 감지되었습니다. 절대 개인정보를 입력하거나 앱을 설치하지 마세요.</p>
      <RiskBarContainer />
    </div>
  );
}

function Bullet() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="bullet-1">
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">앱 이름: ○○뱅크 보안센터</p>
    </div>
  );
}

function Bullet1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="bullet-2">
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:SemiBold',sans-serif] leading-[normal] min-w-px not-italic relative text-[#1b3a5c] text-[13px]">유사 악성 앱: 3건</p>
    </div>
  );
}

function Bullet2() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="bullet-3">
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:SemiBold',sans-serif] leading-[normal] min-w-px not-italic relative text-[#1b3a5c] text-[13px]">분석 기준: 알약 모바일 악성코드 탐지 데이터</p>
    </div>
  );
}

function ReasonsCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[14px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="reasons-card">
      <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">분석된 앱 정보</p>
      <Bullet />
      <Bullet1 />
      <Bullet2 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#fffbeb] content-stretch flex gap-[4px] items-center px-[10px] py-[6px] relative rounded-[8px] shrink-0" data-name="Frame">
      <div aria-hidden className="absolute border border-[#d97706] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
          <circle cx="4" cy="4" fill="#D97706" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#d97706] text-[11px] whitespace-nowrap">확인 필요 (주의)</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#e2e8f0] content-stretch flex gap-[4px] items-center px-[10px] py-[6px] relative rounded-[8px] shrink-0" data-name="Frame">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
          <circle cx="4" cy="4" fill="#64748B" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[11px] whitespace-nowrap">판단 보류 (보통)</p>
    </div>
  );
}

function StateReferences() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-center pt-[12px] relative shrink-0 w-full" data-name="state-references">
      <Frame1 />
      <Frame2 />
    </div>
  );
}

function RiskProbabilityCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[6px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="risk-probability-card">
      <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">위험 확률</p>
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#dc2626] text-[13px] w-[min-content]">위험 가능성: 높음</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start p-[24px] relative shrink-0 w-full" data-name="content">
      <DangerBadgeRow />
      <SummaryCard />
      <ReasonsCard />
      <StateReferences />
      <RiskProbabilityCard />
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

function Send() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="send">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g clipPath="url(#clip0_0_5)" id="send">
          <path d={svgPaths.p3df57c00} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_5">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconPaperPlaneSendShare() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="icon-paper plane send share">
      <Send />
    </div>
  );
}

function BtnSendGuide() {
  return (
    <div className="bg-[#2563eb] content-stretch flex gap-[8px] h-[54px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-send-guide">
      <IconPaperPlaneSendShare />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">부모님께 안내문 보내기</p>
    </div>
  );
}

function BtnDetail() {
  return (
    <div className="bg-white content-stretch flex h-[50px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-detail">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[14px] whitespace-nowrap">상세 정보 보기</p>
    </div>
  );
}

function ActionGroup() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="action-group">
      <BtnSendGuide />
      <BtnDetail />
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

export default function ResultDangerScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="result-danger-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}