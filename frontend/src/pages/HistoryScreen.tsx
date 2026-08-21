import { useEffect, useState } from "react";
import { getScanHistory, type RiskLevel, type ScanSummary } from "@/api/analyze";
import svgUpload from "@/imports/UploadInitialScreen/svg-wqv28lyrjs";

const riskStyle: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  HIGH: { bg: "#fff1f1", text: "#FF5C5C", label: "높은 위험" },
  MEDIUM: { bg: "#FFF7E6", text: "#B45309", label: "확인 필요" },
  UNKNOWN: { bg: "#f4f6fb", text: "#64748b", label: "판단 보류" },
};

function StatusBar() { return <div className="flex h-[44px] items-center justify-between px-[24px]"><p className="font-['Pretendard'] font-semibold text-[#0f172a] text-[15px]">9:41</p><svg className="size-[18px]" fill="none" viewBox="0 0 18 18"><path clipRule="evenodd" d={svgUpload.pc062070} fill="#0F172A" fillRule="evenodd" /></svg></div> }
function HomeIndicator() { return <div className="flex justify-center py-[12px]"><div className="bg-[#0f172a] h-[5px] rounded-full w-[134px]" /></div> }

export function HistoryScreen({ onBack, onOpen }: { onBack: () => void; onOpen: (scanId: string) => void }) {
  const [items, setItems] = useState<ScanSummary[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { getScanHistory(30).then(setItems).catch(() => setError("분석 이력을 불러오지 못했어요.")); }, []);
  return <div className="bg-[#f8fafb] flex flex-col relative w-full min-h-full"><StatusBar/><div className="bg-white flex h-[56px] items-center gap-[12px] px-[24px]"><button onClick={onBack} className="size-[24px]"><svg fill="none" viewBox="0 0 24 24" className="size-full"><path d="M15 18L9 12L15 6" stroke="#1B3A5C" strokeLinecap="round" strokeWidth="2" /></svg></button><p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">분석 이력</p></div><div className="border-b border-[#e2e8f0]"/><div className="flex-1 overflow-y-auto px-[24px] py-[20px]">{error&&<div className="bg-[#fff1f1] rounded-[12px] px-[14px] py-[12px] mb-[16px]"><p className="font-['Pretendard'] text-[#FF5C5C] text-[13px]">{error}</p></div>}{!error&&items.length===0&&<div className="bg-white rounded-[16px] p-[24px] border border-[#ebeff3]"><p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[15px]">아직 분석 이력이 없어요</p><p className="font-['Pretendard'] text-[#64748b] text-[13px] mt-[6px]">앱을 분석하면 이곳에서 최근 결과를 확인할 수 있어요.</p></div>}<div className="flex flex-col gap-[12px]">{items.map(item=>{const s=riskStyle[item.highest_risk_level]||riskStyle.UNKNOWN;return <button key={item.id} onClick={()=>onOpen(item.id)} className="bg-white text-left rounded-[16px] p-[16px] border border-[#ebeff3] w-full"><div className="flex items-center justify-between gap-[12px]"><div className="min-w-0"><p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[14px] truncate">{item.source_label||"앱 분석"}</p><p className="font-['Pretendard'] text-[#94a3b8] text-[12px] mt-[4px]">{new Date(item.created_at).toLocaleString("ko-KR")} · {item.result_count}건</p></div><div className="px-[10px] py-[6px] rounded-full shrink-0" style={{backgroundColor:s.bg}}><p className="font-['Pretendard'] font-bold text-[12px]" style={{color:s.text}}>{s.label}</p></div></div></button>})}</div></div><HomeIndicator/></div>
}
