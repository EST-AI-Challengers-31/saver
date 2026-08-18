import svgPaths from "./svg-w77zqixszq";

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
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">부모님용 안내문</p>
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

function TitleBlock() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 w-full" data-name="title-block">
      <p className="font-['Pretendard:Bold',sans-serif] relative shrink-0 text-[#1b3a5c] text-[20px] w-full">부모님께 보낼 안내문</p>
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#64748b] text-[14px] w-full">부모님이 쉽게 이해하실 수 있도록 다정하고 분명한 말투로 작성된 맞춤 안내문입니다.</p>
    </div>
  );
}

function MessageSquareQuote() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="message-square-quote">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="message-square-quote">
          <path d={svgPaths.p2d6e42c0} id="Vector" stroke="#2563EB" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconQuoteCommentBubbleDiscussion() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]" data-name="icon-quote comment bubble discussion">
      <MessageSquareQuote />
    </div>
  );
}

function CardHeader() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="card-header">
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#2563eb] text-[12px] uppercase whitespace-nowrap">안내문 미리보기</p>
      <IconQuoteCommentBubbleDiscussion />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#dc2626] whitespace-nowrap">⚠️</p>
      <p className="flex-[1_0_0] font-['Pretendard:SemiBold',sans-serif] min-w-px relative text-[#1b3a5c]">지금 바로 지워주세요.</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#dc2626] whitespace-nowrap">⚠️</p>
      <p className="flex-[1_0_0] font-['Pretendard:SemiBold',sans-serif] min-w-px relative text-[#1b3a5c]">설정 → 앱 → OO클리너 → 삭제 누르시면 돼요.</p>
    </div>
  );
}

function ActionBulletGroup() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] py-[8px] relative shrink-0 text-[13px] w-full" data-name="action-bullet-group">
      <Frame />
      <Frame1 />
    </div>
  );
}

function MessageTextBody() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start not-italic relative shrink-0 w-full" data-name="message-text-body">
      <p className="font-['Pretendard:Bold',sans-serif] leading-[normal] relative shrink-0 text-[#1b3a5c] text-[15px] w-full">엄마, 아빠! 폰에 깔린 앱들 확인해봤어요.</p>
      <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1b3a5c] text-[14px] w-full">
        <span className="font-['Pretendard:Regular',sans-serif] leading-[1.5]">{`검사해 보니 `}</span>
        <span className="font-['Pretendard:Bold',sans-serif] leading-[1.5] text-[#dc2626]">’OO클리너’라는 앱이 위험한 앱</span>
        <span className="font-['Pretendard:Regular',sans-serif] leading-[1.5]">이라고 해요. 정상 앱인 척하면서 몰래 문자랑 연락처를 빼가는 앱이에요.</span>
      </p>
      <ActionBulletGroup />
      <p className="font-['Pretendard:Regular',sans-serif] leading-[1.5] relative shrink-0 text-[#1b3a5c] text-[14px] w-full whitespace-pre-wrap">
        {`혹시 지우기 어려우시면 저한테 전화 주세요. `}
        <br aria-hidden />
        제가 같이 해드릴게요!
      </p>
    </div>
  );
}

function MessageCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-start p-[20px] relative rounded-[16px] shrink-0 w-full" data-name="message-card">
      <div aria-hidden className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <CardHeader />
      <MessageTextBody />
    </div>
  );
}

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="check-circle">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g clipPath="url(#clip0_0_8)" id="check-circle">
          <path d={svgPaths.p39f7ce80} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_8">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconCheckmarkTickSuccess() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]" data-name="icon-checkmark tick success">
      <CheckCircle />
    </div>
  );
}

function ToastAlert() {
  return (
    <div className="bg-[#0f172a] content-stretch flex gap-[10px] items-center justify-center px-[16px] py-[12px] relative rounded-[12px] shrink-0 w-full" data-name="toast-alert">
      <IconCheckmarkTickSuccess />
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">안내문이 클립보드에 복사되었습니다 ✓</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative shrink-0 w-full" data-name="content">
      <TitleBlock />
      <MessageCard />
      <ToastAlert />
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

function CheckCircle1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="check-circle">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g clipPath="url(#clip0_0_6)" id="check-circle">
          <path d={svgPaths.p39f7ce80} id="Vector" stroke="#059669" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_6">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconCheckmarkTickSuccess1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[16px]" data-name="icon-checkmark tick success">
      <CheckCircle1 />
    </div>
  );
}

function SuccessToast() {
  return (
    <div className="bg-[#ecfdf5] content-stretch flex gap-[10px] items-center justify-center px-[16px] py-[12px] relative rounded-[12px] shrink-0 w-full" data-name="success-toast">
      <div aria-hidden className="absolute border border-[#059669] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <IconCheckmarkTickSuccess1 />
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#059669] text-[13px] whitespace-nowrap">복사되었습니다! 부모님께 메시지를 보내주세요</p>
    </div>
  );
}

function Copy() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="copy">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g clipPath="url(#clip0_0_16)" id="copy">
          <path d={svgPaths.p1d6f9e80} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_16">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconCopyDocumentFileDuplicate() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="icon-copy document file duplicate">
      <Copy />
    </div>
  );
}

function BtnCopy() {
  return (
    <div className="bg-[#2563eb] content-stretch flex gap-[8px] h-[54px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-copy">
      <IconCopyDocumentFileDuplicate />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">클립보드에 복사하기</p>
    </div>
  );
}

function MessageCircle() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="message-circle">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g clipPath="url(#clip0_0_4)" id="message-circle">
          <path d={svgPaths.p16ccbb80} id="Vector" stroke="#181600" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_4">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconChatMessageSpeechBubbleSpeakTalk() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="icon-chat message speech bubble speak talk">
      <MessageCircle />
    </div>
  );
}

function BtnKakao() {
  return (
    <div className="bg-[#fee500] content-stretch flex gap-[8px] h-[50px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-kakao">
      <IconChatMessageSpeechBubbleSpeakTalk />
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#181600] text-[14px] whitespace-nowrap">카카오톡으로 보내기</p>
    </div>
  );
}

function BtnGroup() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="btn-group">
      <BtnCopy />
      <BtnKakao />
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
      <SuccessToast />
      <BtnGroup />
      <HomeIndicatorContainer />
    </div>
  );
}

export default function ParentGuideScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="parent-guide-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}