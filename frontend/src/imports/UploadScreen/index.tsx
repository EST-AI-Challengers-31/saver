import svgPaths from "./svg-o76u3wcnaf";
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

function TitleBlock() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="title-block">
      <div className="font-['Pretendard:Bold',sans-serif] relative shrink-0 text-[#1b3a5c] text-[22px] w-full">
        <p className="leading-[1.4] mb-0">부모님 폰에 설치된</p>
        <p className="leading-[1.4]">앱 목록 화면을 보내주세요</p>
      </div>
      <div className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#64748b] text-[14px] w-full whitespace-pre-wrap">
        <p className="leading-[normal] mb-0">{`부모님께 화면을 캡처해서 보내달라고 부탁드리세요. `}</p>
        <p className="leading-[normal]">직접 촬영하셔도 됩니다.</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Frame">
      <div className="relative shrink-0 size-[24px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
          <circle cx="12" cy="12" fill="#64748B" id="Ellipse" r="12" />
        </svg>
      </div>
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1b3a5c] text-[12px] whitespace-nowrap">[국제발신]</p>
    </div>
  );
}

function PreviewHeader() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="preview-header">
      <Frame />
      <p className="[word-break:break-word] font-['Pretendard:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#64748b] text-[11px] whitespace-nowrap">오전 10:42</p>
    </div>
  );
}

function PreviewBody() {
  return (
    <div className="[word-break:break-word] bg-white content-stretch flex flex-col gap-[6px] items-start leading-[normal] not-italic p-[12px] relative rounded-[8px] shrink-0 w-full" data-name="preview-body">
      <p className="font-['Pretendard:Bold',sans-serif] relative shrink-0 text-[#dc2626] text-[13px] w-full">[국민건강보험] 지원금 신청 안내</p>
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#64748b] text-[12px] w-full">고객님께서는 미수령 환급금 대상자입니다. 아래 안전 링크를 클릭하시어 즉시 신청바랍니다.</p>
      <p className="font-['Pretendard:SemiBold',sans-serif] relative shrink-0 text-[#2563eb] text-[12px] w-full">nhis-safe-go.net/install</p>
    </div>
  );
}

function StatusBadge() {
  return (
    <div className="bg-[#2563eb] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[6px] shrink-0" data-name="status-badge">
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[11px] text-white whitespace-nowrap">업로드 완료 ✓</p>
    </div>
  );
}

function ScreenshotPreview() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-[1_0_26px] flex-col gap-[12px] items-start min-h-px p-[12px] relative rounded-[12px] w-full" data-name="screenshot-preview">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <PreviewHeader />
      <PreviewBody />
      <StatusBadge />
    </div>
  );
}

function UploadBox() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[280px] items-center justify-center overflow-clip p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="upload-box">
      <ScreenshotPreview />
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

function IconImageGalleryPhoto() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="icon-image gallery photo">
      <GalleryVertical />
    </div>
  );
}

function BtnGallery() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_2px] gap-[8px] h-[48px] items-center justify-center min-w-px relative rounded-[12px]" data-name="btn-gallery">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <IconImageGalleryPhoto />
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

function IconCameraPhotographyPhotoShutter() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[18px]" data-name="icon-camera photography photo shutter">
      <Camera />
    </div>
  );
}

function BtnCamera() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_2px] gap-[8px] h-[48px] items-center justify-center min-w-px relative rounded-[12px]" data-name="btn-camera">
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <IconCameraPhotographyPhotoShutter />
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

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative shrink-0 w-full" data-name="content">
      <TitleBlock />
      <UploadBox />
      <UploadOptions />
    </div>
  );
}

function ScreenBody() {
  return (
    <div className="content-stretch flex flex-col h-[622px] items-start relative shrink-0 w-[391px]" data-name="screen-body">
      <StatusBar />
      <Header />
      <Content />
    </div>
  );
}

function BtnSubmit() {
  return (
    <div className="bg-[#2563eb] content-stretch flex h-[54px] items-center justify-center relative rounded-[14px] shrink-0 w-full" data-name="btn-submit">
      <p className="[word-break:break-word] font-['Pretendard:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">분석 요청하기</p>
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
    <div className="content-stretch flex flex-col gap-[12px] h-[102px] items-start pb-[8px] px-[24px] relative shrink-0 w-[391px]" data-name="bottom-area">
      <BtnSubmit />
      <HomeIndicatorContainer />
    </div>
  );
}

export default function UploadScreen() {
  return (
    <div className="bg-[#f8fafb] content-stretch flex flex-col items-start justify-between relative size-full" data-name="upload-screen">
      <ScreenBody />
      <BottomArea />
    </div>
  );
}