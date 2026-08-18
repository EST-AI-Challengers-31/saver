import { useCallback, useEffect, useState } from "react"

import { ApiError, apiFetch } from "@/api/client"

export interface CurrentUser {
  id: string
  displayName: string | null
  profileImageUrl: string | null
  providers: string[]
  families: Array<{
    familyId: string
    familyName: string
    familyMemberId: string
    role: string
  }>
}

export function useSession() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)

  const refreshSession = useCallback(async () => {
    setIsCheckingSession(true)
    try {
      setUser(await apiFetch<CurrentUser>("/api/me"))
      setLoginError(null)
    } catch (error) {
      setUser(null)
      if (!(error instanceof ApiError && error.status === 401)) {
        setLoginError(error instanceof Error ? error.message : "로그인 상태를 확인하지 못했습니다.")
      }
    } finally {
      setIsCheckingSession(false)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has("loginError")) {
      setLoginError("카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.")
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    void refreshSession()
  }, [refreshSession])

  return { user, isCheckingSession, loginError, refreshSession }
}
