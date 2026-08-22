import { useRef, useState } from "react";

import {
  analyzeFraudText,
  analyzeVoiceAudio,
  type FraudAnalysisType,
  type FraudAnalyzeResponse,
} from "@/api/fraud";

interface FraudScreenProps {
  onBack: () => void;
}

const MODE_META: Record<FraudAnalysisType, { title: string; description: string; placeholder: string }> = {
  SMISHING: {
    title: "스미싱 문자",
    description: "문자 내용과 링크를 함께 확인합니다.",
    placeholder: "받은 문자 내용을 그대로 붙여넣어 주세요. 링크가 있다면 함께 넣어 주세요.",
  },
  VOICE_PHISHING: {
    title: "보이스피싱",
    description: "통화 녹음 또는 통화 내용을 분석합니다.",
    placeholder: "통화 내용을 알고 있다면 여기에 적어 주세요. 녹음 파일을 올려도 됩니다.",
  },
  FINANCIAL_FRAUD: {
    title: "금융사기",
    description: "투자·대출·송금 제안의 위험 신호를 확인합니다.",
    placeholder: "투자, 대출, 송금 제안 내용을 붙여넣어 주세요.",
  },
};

export function FraudScreen({ onBack }: FraudScreenProps) {
  const [mode, setMode] = useState<FraudAnalysisType>("SMISHING");
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [result, setResult] = useState<FraudAnalyzeResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async () => {
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const response = mode === "VOICE_PHISHING" && audio
        ? await analyzeVoiceAudio(audio)
        : await analyzeFraudText(mode, text.trim());
      setResult(response);
      if (response.transcript) setText(response.transcript);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const riskStyle = result?.risk_level === "HIGH"
    ? "bg-[#fff1f1] text-[#d9363e] border-[#ffc9cc]"
    : result?.risk_level === "MEDIUM"
      ? "bg-[#fff8e6] text-[#9a6700] border-[#ffe2a8]"
      : "bg-[#eef4ff] text-[#315f9c] border-[#d4e2ff]";
  const riskLabel = result?.risk_level === "HIGH" ? "위험 가능성 높음" : result?.risk_level === "MEDIUM" ? "확인 필요" : "판단 보류";

  return (
    <div className="bg-[#f8fafb] flex flex-col h-full min-h-0">
      <div className="bg-white flex h-[56px] items-center gap-[12px] px-[24px] shrink-0 border-b border-[#e2e8f0]">
        <button onClick={onBack} className="size-[24px] text-[#1b3a5c] text-[24px]">‹</button>
        <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">사기 위험 확인</p>
      </div>

      <div className="flex-1 overflow-y-auto px-[24px] py-[22px]">
        <div className="grid grid-cols-3 gap-[8px]">
          {(Object.keys(MODE_META) as FraudAnalysisType[]).map((item) => (
            <button key={item} onClick={() => { setMode(item); setResult(null); setError(""); setAudio(null); }} className={`rounded-[12px] px-[8px] py-[12px] border font-['Pretendard'] text-[12px] font-bold ${mode === item ? "bg-[#4F8CFF] border-[#4F8CFF] text-white" : "bg-white border-[#e2e8f0] text-[#64748b]"}`}>{MODE_META[item].title}</button>
          ))}
        </div>

        <div className="mt-[20px]">
          <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[22px]">{MODE_META[mode].title} 확인</p>
          <p className="font-['Pretendard'] text-[#64748b] text-[13px] mt-[6px]">{MODE_META[mode].description}</p>
        </div>

        {mode === "VOICE_PHISHING" && (
          <div className="mt-[18px] bg-white rounded-[16px] p-[16px] border border-[#e2e8f0]">
            <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px]">통화 녹음 파일</p>
            <p className="font-['Pretendard'] text-[#94a3b8] text-[11px] mt-[4px]">음성은 저장하지 않고 STT 변환 후 위험 신호만 분석합니다.</p>
            <input ref={fileRef} className="hidden" type="file" accept="audio/*,.m4a,.mp3,.wav,.flac,.ogg,.aac" onChange={(event) => setAudio(event.target.files?.[0] || null)} />
            <button onClick={() => fileRef.current?.click()} className="mt-[12px] w-full h-[44px] rounded-[11px] border border-[#cbd5e1] bg-[#f8fafb] font-['Pretendard'] font-semibold text-[#334155] text-[13px]">{audio ? audio.name : "녹음 파일 선택"}</button>
          </div>
        )}

        <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={MODE_META[mode].placeholder} className="mt-[16px] w-full min-h-[180px] resize-none rounded-[16px] border border-[#e2e8f0] bg-white p-[16px] outline-none font-['Pretendard'] text-[#0f172a] text-[14px] placeholder:text-[#94a3b8] focus:border-[#4F8CFF]" />

        {error && <div className="mt-[12px] rounded-[12px] bg-[#fff1f1] px-[14px] py-[11px] font-['Pretendard'] text-[#d9363e] text-[12px]">{error}</div>}

        <button disabled={busy || (!text.trim() && !(mode === "VOICE_PHISHING" && audio))} onClick={analyze} className="mt-[14px] w-full h-[50px] rounded-[12px] bg-[#4F8CFF] disabled:bg-[#b8c8e8] text-white font-['Pretendard'] font-bold text-[15px]">{busy ? "분석 중..." : "위험 신호 분석하기"}</button>

        {result && (
          <div className="mt-[22px] space-y-[14px] pb-[24px]">
            <div className={`rounded-[18px] border p-[18px] ${riskStyle}`}>
              <div className="flex items-center justify-between">
                <p className="font-['Pretendard'] font-extrabold text-[19px]">{riskLabel}</p>
                <p className="font-['Pretendard'] font-bold text-[13px]">신호 {Math.round(result.risk_score * 100)}%</p>
              </div>
              <p className="font-['Pretendard'] text-[13px] leading-[1.65] mt-[10px]">{result.child_message}</p>
            </div>

            <div className="bg-white rounded-[18px] p-[18px] border border-[#e2e8f0]">
              <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[16px]">확인된 근거</p>
              <div className="mt-[12px] space-y-[9px]">
                {result.indicators.length === 0 && <p className="font-['Pretendard'] text-[#64748b] text-[12px]">현재 텍스트에서 뚜렷한 위험 신호를 찾지 못했습니다. 안전 판정을 의미하지는 않습니다.</p>}
                {result.indicators.map((indicator) => (
                  <div key={indicator.code} className="rounded-[11px] bg-[#f8fafb] px-[12px] py-[10px]">
                    <p className="font-['Pretendard'] font-semibold text-[#334155] text-[12px]">{indicator.category}</p>
                    <p className="font-['Pretendard'] text-[#64748b] text-[11px] mt-[3px]">{indicator.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[18px] p-[18px] border border-[#e2e8f0]">
              <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[16px]">부모님께 이렇게 알려주세요</p>
              <p className="font-['Pretendard'] text-[#334155] text-[13px] leading-[1.7] mt-[10px]">{result.parent_message}</p>
              <button onClick={() => navigator.clipboard?.writeText(result.parent_message)} className="mt-[12px] h-[40px] px-[14px] rounded-[10px] bg-[#eef4ff] text-[#4F8CFF] font-['Pretendard'] font-bold text-[12px]">안내문 복사</button>
            </div>

            <div className="bg-white rounded-[18px] p-[18px] border border-[#e2e8f0]">
              <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[16px]">지금 할 일</p>
              <ol className="mt-[10px] space-y-[8px]">
                {result.recommended_actions.map((action, index) => <li key={`${index}-${action}`} className="font-['Pretendard'] text-[#475569] text-[12px] leading-[1.6]">{index + 1}. {action}</li>)}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
