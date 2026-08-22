export type FraudAnalysisType = "SMISHING" | "VOICE_PHISHING" | "FINANCIAL_FRAUD";
export type FraudRiskLevel = "HIGH" | "MEDIUM" | "UNKNOWN";

export interface FraudIndicator {
  code: string;
  category: string;
  evidence: string;
  weight: number;
}

export interface FraudAnalyzeResponse {
  analysis_id?: string | null;
  analysis_type: FraudAnalysisType;
  risk_level: FraudRiskLevel;
  risk_score: number;
  indicators: FraudIndicator[];
  urls: string[];
  transcript?: string | null;
  child_message: string;
  parent_message: string;
  recommended_actions: string[];
  external_checks: Record<string, unknown>;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `요청 실패: ${response.status}`;
    try {
      const payload = await response.json();
      message = payload?.detail || payload?.message || message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function analyzeFraudText(
  analysisType: FraudAnalysisType,
  text: string,
): Promise<FraudAnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/fraud/analyze`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analysisType, text }),
  });
  return readJson<FraudAnalyzeResponse>(response);
}

export async function analyzeVoiceAudio(file: File): Promise<FraudAnalyzeResponse> {
  const formData = new FormData();
  formData.append("media", file);
  const response = await fetch(`${API_BASE_URL}/api/fraud/voice/audio`, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });
  return readJson<FraudAnalyzeResponse>(response);
}
