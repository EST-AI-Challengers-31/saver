import svgPaths from "./svg-8kiebeh0qh";

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

function ChevronLeft() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron-left">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="chevron-left">
          <path d="M15 18L9 12L15 6" id="Vector" stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronLeftBackArrow() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[24px]" data-name="icon-chevron left back arrow">
      <ChevronLeft />
    </div>
  );
}

function HeaderLeft() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="header-left">
      <IconChevronLeftBackArrow />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">분석 상세 정보</p>
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

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Pretendard:Bold',sans-serif] items-center justify-between leading-[normal] not-italic relative shrink-0 w-full whitespace-nowrap" data-name="Frame">
      <p className="relative shrink-0 text-[#1b3a5c] text-[14px]">Android.Trojan.Agent 계열</p>
      <p className="relative shrink-0 text-[#dc2626] text-[12px]">유사도 92%</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#e2e8f0] content-stretch flex h-[6px] items-start overflow-clip relative rounded-[3px] shrink-0 w-full" data-name="Frame">
      <div className="bg-[#dc2626] h-full relative shrink-0 w-[310px]" data-name="Rectangle" />
    </div>
  );
}

function SimilarCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start p-[16px] relative rounded-[12px] shrink-0 w-full" data-name="similar-card">
      <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame />
      <Frame1 />
    </div>
  );
}

function SectionSimilar() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="section-similar">
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[15px] w-full">유사 악성 앱 정보</p>
      <SimilarCard />
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-down">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="chevron-down">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="#64748B" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronDownArrow() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]" data-name="icon-chevron down arrow">
      <ChevronDown />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">유사 악성 앱 탐지 이력 있음</p>
      <IconChevronDownArrow />
    </div>
  );
}

function ExpandableCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start p-[16px] relative rounded-[12px] shrink-0 w-full" data-name="expandable-card-1">
      <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame2 />
      <div className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#64748b] text-[13px] w-full">
        <p className="leading-[1.4] mb-0">알약 모바일 백신에서 유사한 악성 앱으로 탐지된 기록이 있습니다.</p>
        <p className="leading-[1.4]">진단명: Android.Trojan.Agent</p>
      </div>
    </div>
  );
}

function ChevronDown1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-down">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="chevron-down">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="#64748B" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronDownArrow1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]" data-name="icon-chevron down arrow">
      <ChevronDown1 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">유사 악성코드 유형: Trojan</p>
      <IconChevronDownArrow1 />
    </div>
  );
}

function ExpandableCard1() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start p-[16px] relative rounded-[12px] shrink-0 w-full" data-name="expandable-card-2">
      <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame3 />
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#64748b] text-[13px] w-full">정상 앱인 것처럼 위장해 설치된 뒤, 문자와 연락처를 탈취하는 유형입니다.</p>
    </div>
  );
}

function SectionReasons() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="section-reasons">
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[15px] w-full">위험 판단 이유</p>
      <ExpandableCard />
      <ExpandableCard1 />
    </div>
  );
}

function Mail() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="mail">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="mail">
          <path d={svgPaths.p32e4b800} id="Vector" stroke="#DC2626" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconSmsTextEnvelopeMail() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="icon-sms text envelope mail">
      <Mail />
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#fef2f2] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="Frame">
      <IconSmsTextEnvelopeMail />
    </div>
  );
}

function Frame5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic relative whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold relative shrink-0 text-[#1b3a5c] text-[13px]">SMS 수신 및 발신 권한 탈취</p>
      <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal relative shrink-0 text-[#64748b] text-[11px]">문자 정보 탈취 가능성</p>
    </div>
  );
}

function PermItem() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="perm-item-1">
      <Frame4 />
      <Frame5 />
    </div>
  );
}

function Contact() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="contact-2">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="contact-2">
          <path d={svgPaths.p1958d380} id="Vector" stroke="#DC2626" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconPhoneCallDirectoryContacts() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[20px]" data-name="icon-phone call directory contacts">
      <Contact />
    </div>
  );
}

function Frame6() {
  return (
    <div className="bg-[#fef2f2] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="Frame">
      <IconPhoneCallDirectoryContacts />
    </div>
  );
}

function Frame7() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic relative whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold relative shrink-0 text-[#1b3a5c] text-[13px]">주소록 및 연락처 접근 탈취</p>
      <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal relative shrink-0 text-[#64748b] text-[11px]">개인정보 탈취 가능성</p>
    </div>
  );
}

function PermItem1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="perm-item-2">
      <Frame6 />
      <Frame7 />
    </div>
  );
}

function PermissionList() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[14px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="permission-list">
      <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <PermItem />
      <PermItem1 />
    </div>
  );
}

function SectionPermissions() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="section-permissions">
      <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[15px] w-full">이 유형에서 발생할 수 있는 피해</p>
      <PermissionList />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative shrink-0 w-full" data-name="content">
      <SectionSimilar />
      <SectionReasons />
      <SectionPermissions />
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[12px] text-center w-full">본 결과는 알약 모바일 악성코드 탐지 데이터와의 유사성을 기반으로 분석한 결과이며, 실제 앱을 직접 검사한 결과와 다를 수 있습니다.</p>
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

export default function DetailScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="detail-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}