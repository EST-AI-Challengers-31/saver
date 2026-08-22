export interface MeResponse {
  authenticated: boolean;
  id?: string | null;
  displayName?: string | null;
  profileImage?: string | null;
  provider?: string | null;
}

interface CsrfResponse {
  token: string;
  headerName: string;
  parameterName: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function getMe(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/me`, { credentials: "same-origin" });
  if (!response.ok) return { authenticated: false };
  return response.json() as Promise<MeResponse>;
}

export function startKakaoLogin(): void {
  const invite = new URLSearchParams(window.location.search).get("invite");
  if (invite) localStorage.setItem("dahum_pending_invite", invite);
  window.location.assign(`${API_BASE_URL}/oauth2/authorization/kakao`);
}

export async function getCsrf(): Promise<CsrfResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, { credentials: "same-origin" });
  if (!response.ok) throw new Error("보안 토큰을 가져오지 못했습니다.");
  return response.json() as Promise<CsrfResponse>;
}
