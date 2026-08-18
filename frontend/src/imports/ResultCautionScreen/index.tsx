import svgPaths from "./svg-gzlyngtn0k";
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

function CircleQuestionMark() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="circle-question-mark">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g clipPath="url(#clip0_0_6)" id="circle-question-mark">
          <path d={svgPaths.p2ddf3d80} id="Vector" stroke="#F59E0B" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_6">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconCaution() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]" data-name="icon-caution">
      <CircleQuestionMark />
    </div>
  );
}

function BadgeCaution() {
  return (
    <div className="bg-[#fef3c7] content-stretch flex gap-[6px] items-center px-[16px] py-[8px] relative rounded-[100px] shrink-0" data-name="badge-caution">
      <div aria-hidden className="absolute border border-[#f59e0b] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <IconCaution />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#f59e0b] text-[14px] whitespace-nowrap">확인 필요</p>
    </div>
  );
}

function BadgeRow() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="badge-row">
      <BadgeCaution />
    </div>
  );
}

function SummaryCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="summary-card">
      <div aria-hidden className="absolute border border-[#f59e0b] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[0] not-italic relative shrink-0 text-[#1b3a5c] text-[20px] whitespace-nowrap">
        <p className="leading-[1.4] mb-0">추가 확인이 필요한</p>
        <p className="leading-[1.4]">앱이에요</p>
      </div>
      <p className="[word-break:break-word] font-['Pretendard:Regular',sans-serif] leading-[1.5] min-w-full not-italic relative shrink-0 text-[#64748b] text-[14px] w-[min-content]">완전히 안전하다고 보기 어렵지만, 위험하다고 단정하기도 어려워요. 아래 내용을 참고해서 직접 확인해주세요.</p>
    </div>
  );
}

function Bullet() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[normal] not-italic relative shrink-0 w-full" data-name="bullet-1">
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#f59e0b] text-[14px] whitespace-nowrap">•</p>
      <p className="flex-[1_0_0] font-['Pretendard:SemiBold',sans-serif] min-w-px relative text-[#1b3a5c] text-[13px]">일부 의심스러운 패턴이 감지됨</p>
    </div>
  );
}

function Bullet1() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[normal] not-italic relative shrink-0 w-full" data-name="bullet-2">
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#f59e0b] text-[14px] whitespace-nowrap">•</p>
      <p className="flex-[1_0_0] font-['Pretendard:SemiBold',sans-serif] min-w-px relative text-[#1b3a5c] text-[13px]">정상 앱과 유사하지만 확인 필요한 부분 있음</p>
    </div>
  );
}

function PointsCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[14px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="points-card">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">감지된 주요 포인트</p>
      <Bullet />
      <Bullet1 />
    </div>
  );
}

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="check-circle">
      <svg className="absolute block inset-0 size-full" fill="none" height="10" preserveAspectRatio="none" viewBox="0 0 10 10" width="10">
        <g clipPath="url(#clip0_0_4)" id="check-circle">
          <path d={svgPaths.p14f15218} id="Vector" stroke="#F59E0B" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_4">
            <rect fill="white" height="10" width="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ChkIcon() {
  return (
    <div className="bg-[#fef3c7] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[16px]" data-name="chk-icon">
      <CheckCircle />
    </div>
  );
}

function ActionItem() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="action-item-0">
      <ChkIcon />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-w-px not-italic relative text-[#1b3a5c] text-[13px]">공식 앱스토어에서 해당 앱 검색해보기</p>
    </div>
  );
}

function CheckCircle1() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="check-circle">
      <svg className="absolute block inset-0 size-full" fill="none" height="10" preserveAspectRatio="none" viewBox="0 0 10 10" width="10">
        <g clipPath="url(#clip0_0_4)" id="check-circle">
          <path d={svgPaths.p14f15218} id="Vector" stroke="#F59E0B" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_4">
            <rect fill="white" height="10" width="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ChkIcon1() {
  return (
    <div className="bg-[#fef3c7] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[16px]" data-name="chk-icon">
      <CheckCircle1 />
    </div>
  );
}

function ActionItem1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="action-item-1">
      <ChkIcon1 />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-w-px not-italic relative text-[#1b3a5c] text-[13px]">앱 개발사 직접 검색해보기</p>
    </div>
  );
}

function CheckCircle2() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="check-circle">
      <svg className="absolute block inset-0 size-full" fill="none" height="10" preserveAspectRatio="none" viewBox="0 0 10 10" width="10">
        <g clipPath="url(#clip0_0_4)" id="check-circle">
          <path d={svgPaths.p14f15218} id="Vector" stroke="#F59E0B" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_4">
            <rect fill="white" height="10" width="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ChkIcon2() {
  return (
    <div className="bg-[#fef3c7] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[16px]" data-name="chk-icon">
      <CheckCircle2 />
    </div>
  );
}

function ActionItem2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="action-item-2">
      <ChkIcon2 />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-w-px not-italic relative text-[#1b3a5c] text-[13px]">가족이나 지인에게 확인하기</p>
    </div>
  );
}

function ActionsCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[14px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="actions-card">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">확인해볼 것</p>
      <ActionItem />
      <ActionItem1 />
      <ActionItem2 />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start p-[24px] relative shrink-0 w-full" data-name="content">
      <BadgeRow />
      <SummaryCard />
      <PointsCard />
      <ActionsCard />
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
        <g clipPath="url(#clip0_0_10)" id="send">
          <path d={svgPaths.p3df57c00} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_10">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconSend() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="icon-send">
      <Send />
    </div>
  );
}

function BtnSendGuide() {
  return (
    <div className="bg-[#2563eb] content-stretch flex gap-[8px] h-[54px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-send-guide">
      <IconSend />
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

export default function ResultCautionScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="result-caution-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}