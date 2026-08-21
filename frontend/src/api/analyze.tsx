export type RiskLevel = "HIGH" | "MEDIUM" | "UNKNOWN";
export type MatchType = "EXACT" | "VECTOR" | "NONE";

export interface MatchedExample {
  malware_name: string;
  malware_package: string;
  malware_category: string;
  score: number;
}

export interface AnalyzeResultItem {
  package_name: string;
  display_query?: string | null;
  risk_level: RiskLevel;
  match_type: MatchType;
  exact_field?: "PACKAGE" | "MALWARE_NAME" | null;
  matched: boolean;
  similarity_score?: number | null;
  malware_names: string[];
  malware_categories: string[];
  matched_examples: MatchedExample[];
  evidence_summary: string;
  child_message: string;
  parent_message: string;
  recommended_actions: string[];
  explanation_method?: "LLM" | "TEMPLATE";
  is_verified_safe: boolean;
}

export interface AnalyzeResponse {
  scan_id?: string | null;
  results: AnalyzeResultItem[];
  policy?: string;
  similarity_threshold?: number;
  vector_provider?: string;
}

export interface ScanSummary {
  id: string;
  source_type: string;
  source_label?: string | null;
  highest_risk_level: RiskLevel;
  result_count: number;
  created_at: string;
}

export interface ScanDetail {
  id: string;
  source_type: string;
  source_label?: string | null;
  highest_risk_level: RiskLevel;
  created_at: string;
  results: AnalyzeResultItem[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`요청 실패: ${response.status} ${text}`);
  }
  return response.json() as Promise<T>;
}

export async function analyzeImage(imageFile: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);
  const response = await fetch(`${API_BASE_URL}/api/analyze`, { method: "POST", body: formData });
  return readJson<AnalyzeResponse>(response);
}

export async function analyzeText(query: string): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return readJson<AnalyzeResponse>(response);
}

export async function getScanHistory(limit = 20): Promise<ScanSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/scans?limit=${limit}`);
  return readJson<ScanSummary[]>(response);
}

export async function getScanDetail(scanId: string): Promise<ScanDetail> {
  const response = await fetch(`${API_BASE_URL}/api/scans/${encodeURIComponent(scanId)}`);
  return readJson<ScanDetail>(response);
}
