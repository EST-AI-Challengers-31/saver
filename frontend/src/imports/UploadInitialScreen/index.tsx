import svgPaths from "./svg-wqv28lyrjs";
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
    <div className="content-stretch flex items-center relative shrink-0" data-name="brand-group">
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">닿음</p>
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

function TitleBlock() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.4] not-italic relative shrink-0 w-full" data-name="title-block">
      <p className="font-['Pretendard:Bold',sans-serif] relative shrink-0 text-[#1b3a5c] text-[22px] w-full">부모님 폰의 앱 목록 화면을 보내주세요</p>
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#64748b] text-[14px] w-full">부모님의 앱 설치 화면 등을 촬영하거나 선택해주세요</p>
    </div>
  );
}

function CameraOff() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="camera-off">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="camera-off">
          <path d={svgPaths.p17b66980} id="Vector" stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex flex-col items-center justify-center relative rounded-[24px] shrink-0 size-[48px]" data-name="icon-container">
      <CameraOff />
    </div>
  );
}

function EmptyUploadBox() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] h-[280px] items-center justify-center p-[24px] relative rounded-[16px] shrink-0 w-full" data-name="empty-upload-box">
      <div aria-hidden className="absolute border-2 border-[#e2e8f0] border-dashed inset-0 pointer-events-none rounded-[16px]" />
      <IconContainer />
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[14px] text-center whitespace-nowrap">이미지를 선택하거나 촬영해주세요</p>
    </div>
  );
}

function GalleryVertical() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="gallery-vertical">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="gallery-vertical">
          <path d={svgPaths.p16e68700} id="Vector" stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconGallery() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="icon-gallery">
      <GalleryVertical />
    </div>
  );
}

function BtnGallery() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_2px] gap-[8px] h-[48px] items-center justify-center min-w-px relative rounded-[12px]" data-name="btn-gallery">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <IconGallery />
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">갤러리에서 선택</p>
    </div>
  );
}

function Camera() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="camera">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="camera">
          <path d={svgPaths.p31882300} id="Vector" stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconCamera() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="icon-camera">
      <Camera />
    </div>
  );
}

function BtnCamera() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_2px] gap-[8px] h-[48px] items-center justify-center min-w-px relative rounded-[12px]" data-name="btn-camera">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <IconCamera />
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">카메라로 촬영</p>
    </div>
  );
}

function UploadOptions() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="upload-options">
      <BtnGallery />
      <BtnCamera />
    </div>
  );
}

function DividerOr() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="divider-or">
      <div className="bg-[#e2e8f0] flex-[1_0_0] h-px min-w-px relative" data-name="line-left" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[12px] whitespace-nowrap">or</p>
      <div className="bg-[#e2e8f0] flex-[1_0_0] h-px min-w-px relative" data-name="line-right" />
    </div>
  );
}

function AppNameInput() {
  return (
    <div className="bg-white content-stretch flex h-[48px] items-center px-[16px] relative rounded-[12px] shrink-0 w-full" data-name="app-name-input">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] min-w-px not-italic relative text-[#94a3b8] text-[14px]">앱 이름을 입력하세요</p>
    </div>
  );
}

function BtnAnalyze() {
  return (
    <div className="bg-[#1b3a5c] content-stretch flex h-[48px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="btn-analyze">
      <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">분석하기</p>
    </div>
  );
}

function AppNameInputSection() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="app-name-input-section">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[14px] whitespace-nowrap">앱 이름 직접 입력</p>
      <AppNameInput />
      <BtnAnalyze />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative shrink-0 w-full" data-name="content">
      <TitleBlock />
      <EmptyUploadBox />
      <UploadOptions />
      <DividerOr />
      <AppNameInputSection />
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

function BtnSubmit() {
  return (
    <div className="bg-[#e2e8f0] content-stretch flex h-[54px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-submit">
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#94a3b8] text-[16px] whitespace-nowrap">분석 요청하기</p>
    </div>
  );
}

function BtnSubmitDisabled() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-full" data-name="btn-submit-disabled">
      <BtnSubmit />
      <p className="[word-break:break-word] font-['Pretendard:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[12px] whitespace-nowrap">이미지를 먼저 선택해주세요</p>
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
      <BtnSubmitDisabled />
      <HomeIndicatorContainer />
    </div>
  );
}

export default function UploadInitialScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="upload-initial-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}