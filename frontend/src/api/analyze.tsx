export interface AnalyzeResultItem {
  패키지명: string;
  child_message: string;
  parent_message: string;
}

export interface AnalyzeResponse {
  results: AnalyzeResultItem[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";

export async function analyzeImage(imageFile: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`분석 요청 실패: ${response.status}`);
  }

  return response.json();
}
