import { useState } from "react"
import svgDetail from "@/imports/DetailScreen/svg-8kiebeh0qh"
import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs"

export type Verdict = "danger" | "caution" | "uncertain"

export interface AnalysisResult {
  verdict: Verdict
  similarity: number
  similarCount: number
}

const VC = {
  danger: {
    badgeBg: "#fff1f1",
    malwareName: "Android.Trojan.Agent 계열",
    malwareSim: 92,
    malwareColor: "#FF5C5C",
    accordionItems: [
      {
        title: "유사 악성 앱 탐지 이력 있음",
        body: "알약 모바일 백신에서 유사한 악성 앱으로 탐지된 기록이 있습니다.\n진단명: Android.Trojan.Agent",
      },
      {
        title: "유사 악성코드 유형: Trojan",
        body: "정상 앱인 것처럼 위장해 설치된 뒤, 문자와 연락처를 탈취하는 유형입니다.",
      },
    ],
  },
  caution: {
    badgeBg: "#FFF7E6",
    malwareName: "Android.Adware.Agent 계열",
    malwareSim: 65,
    malwareColor: "#F59E0B",
    accordionItems: [
      {
        title: "광고성 앱 패턴 감지",
        body: "사용자 동의 없이 광고를 노출하거나, 개인정보를 수집할 수 있는 패턴이 발견되었습니다.",
      },
      {
        title: "과도한 권한 요청",
        body: "앱 기능과 관련 없는 권한(연락처, 위치, 문자 등)을 요청하는 패턴이 있습니다.",
      },
    ],
  },
  uncertain: {
    badgeBg: "#f4f6fb",
    malwareName: "유사 악성 앱 없음",
    malwareSim: 0,
    malwareColor: "#94a3b8",
    accordionItems: [
      {
        title: "탐지된 특이사항 없음",
        body: "현재 데이터베이스에서 유사한 악성 앱이 발견되지 않았습니다. 새로운 악성 앱이 등록될 수 있으므로 주의가 필요합니다.",
      },
    ],
  },
}

function StatusBar() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <p className="font-['Pretendard'] font-semibold leading-[normal] relative shrink-0 text-[#0f172a] text-[15px] whitespace-nowrap">
        9:41
      </p>
      <div className="flex gap-[6px] items-center">
        <div className="relative shrink-0 size-[18px]">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              clipRule="evenodd"
              d={svgUpload.pc062070}
              fill="#0F172A"
              fillRule="evenodd"
            />
          </svg>
        </div>
        <div className="relative shrink-0 size-[18px]">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              clipRule="evenodd"
              d={svgUpload.p23837e00}
              fill="#0F172A"
              fillRule="evenodd"
            />
          </svg>
        </div>
        <div className="h-[18px] relative shrink-0 w-[26px]">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            viewBox="0 0 26 18"
          >
            <path d={svgUpload.p1f206500} fill="#0F172A" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function BackHeader({
  title,
  onBack,
  onMenuOpen,
}: {
  title: string
  onBack: () => void
  onMenuOpen: () => void
}) {
  return (
    <div className="bg-white content-stretch flex h-[56px] items-center justify-between px-[24px] relative shrink-0 w-full">
      <div className="flex gap-[12px] items-center">
        <button
          onClick={onBack}
          className="flex items-center justify-center shrink-0 size-[24px]"
        >
          <svg
            className="block size-full"
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#1B3A5C"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <p className="font-['Pretendard'] font-bold leading-[normal] shrink-0 text-[#1b3a5c] text-[18px] whitespace-nowrap">
          {title}
        </p>
      </div>
      <button
        onClick={onMenuOpen}
        className="flex flex-col items-center justify-center shrink-0 size-[24px]"
      >
        <svg
          className="block size-full"
          fill="none"
          height="24"
          viewBox="0 0 24 24"
          width="24"
        >
          <path
            d={svgDetail.p15b88b00}
            stroke="#1B3A5C"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  )
}

function HomeIndicator() {
  return (
    <div className="flex items-start justify-center py-[12px] w-full">
      <div className="bg-[#0f172a] h-[5px] rounded-[100px] w-[134px]" />
    </div>
  )
}

interface DetailScreenProps {
  appName: string
  result: AnalysisResult
  onBack: () => void
  onMenuOpen: () => void
}

export function DetailScreen({
  appName,
  result,
  onBack,
  onMenuOpen,
}: DetailScreenProps) {
  const [openAccordion, setOpenAccordion] = useState<number[]>([0])
  const v = VC[result.verdict]

  const toggle = (i: number) =>
    setOpenAccordion((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    )

  return (
    <div className="bg-[#f8fafb] flex flex-col items-start justify-between relative w-full min-h-full">
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto">
        <StatusBar />
        <BackHeader
          title="분석 상세 정보"
          onBack={onBack}
          onMenuOpen={onMenuOpen}
        />
        <div className="flex flex-col gap-[24px] p-[24px] w-full">
          <div className="flex flex-col gap-[12px] w-full">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[15px] w-full">
              유사 악성 앱 정보
            </p>
            <div className="bg-white flex flex-col gap-[12px] p-[16px] relative rounded-[12px] w-full">
              <div
                aria-hidden
                className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[12px]"
              />
              <div className="flex items-center justify-between w-full">
                <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px]">
                  {v.malwareName}
                </p>
                <p
                  className="font-['Pretendard'] font-bold text-[12px]"
                  style={{ color: v.malwareColor }}
                >
                  유사도 {v.malwareSim}%
                </p>
              </div>
              <div className="bg-[#e2e8f0] h-[6px] overflow-clip rounded-[3px] w-full">
                <div
                  className="h-full rounded-[3px]"
                  style={{
                    width: `${v.malwareSim}%`,
                    backgroundColor: v.malwareColor,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[12px] w-full">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[15px] w-full">
              위험 판단 이유
            </p>
            {v.accordionItems.map((item, i) => (
              <div
                key={i}
                className="bg-white flex flex-col p-[16px] relative rounded-[12px] w-full"
              >
                <div
                  aria-hidden
                  className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[12px]"
                />
                <button
                  onClick={() => toggle(i)}
                  className="flex items-center justify-between w-full"
                >
                  <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px] text-left">
                    {item.title}
                  </p>
                  <svg
                    fill="none"
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                    className={`shrink-0 transition-transform duration-200 ${
                      openAccordion.includes(i) ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#64748B"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{ maxHeight: openAccordion.includes(i) ? 200 : 0 }}
                >
                  <p className="font-['Pretendard'] font-normal leading-[1.4] text-[#64748b] text-[13px] mt-[8px] whitespace-pre-wrap">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[12px] w-full">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[15px] w-full">
              이 유형에서 발생할 수 있는 피해
            </p>
            <div className="bg-white flex flex-col gap-[14px] p-[16px] relative rounded-[16px] w-full">
              <div
                aria-hidden
                className="absolute border border-[#ebeff3] border-solid inset-0 pointer-events-none rounded-[16px]"
              />
              {[
                {
                  icon: svgDetail.p32e4b800,
                  label: "SMS 수신 및 발신 권한 탈취",
                  sub: "문자 정보 탈취 가능성",
                },
                {
                  icon: svgDetail.p1958d380,
                  label: "주소록 및 연락처 접근 탈취",
                  sub: "개인정보 탈취 가능성",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex gap-[12px] items-center w-full"
                >
                  <div
                    className="flex items-center justify-center rounded-[8px] shrink-0 size-[36px]"
                    style={{ backgroundColor: v.badgeBg }}
                  >
                    <svg
                      className="block size-[20px]"
                      fill="none"
                      height="20"
                      viewBox="0 0 20 20"
                      width="20"
                    >
                      <path
                        d={row.icon}
                        stroke={v.malwareColor}
                        strokeLinecap="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-1 flex-col gap-[2px] min-w-0">
                    <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[13px] whitespace-nowrap">
                      {row.label}
                    </p>
                    <p className="font-['Pretendard'] font-normal text-[#64748b] text-[11px] whitespace-nowrap">
                      {row.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="font-['Pretendard'] font-normal leading-[1.5] text-[#64748b] text-[12px] text-center w-full">
            본 결과는 알약 모바일 악성코드 탐지 데이터와의 유사성을 기반으로
            분석한 결과이며, 실제 앱을 직접 검사한 결과와 다를 수 있습니다.
          </p>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <HomeIndicator />
      </div>
    </div>
  )
}