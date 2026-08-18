import { useCallback, useState } from "react"

import { apiFetch } from "@/api/client"

export interface DemoCheckResponse {
  appName: string
  level: "HIGH" | "MEDIUM" | "UNKNOWN"
  message: string
  evidence: string | null
}

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const analyzeApp = useCallback(async (appName: string) => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      return await apiFetch<DemoCheckResponse>("/api/demo/check", {
        method: "POST",
        body: JSON.stringify({ appName }),
      })
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "분석 요청에 실패했습니다.")
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return { analyzeApp, isAnalyzing, analysisError }
}
