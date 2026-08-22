import { getCsrf } from "@/api/auth";

export interface FamilyMember {
  member_id: string;
  member_role: "CHILD" | "PARENT" | "OTHER";
  member_status: string;
  user_id: string;
  display_name?: string | null;
  profile_image_url?: string | null;
  joined_at?: string;
}

export interface FamilyOverview {
  connected: boolean;
  familyGroupId?: string;
  groupName?: string;
  myRole?: string;
  members: FamilyMember[];
}

export interface FamilyInvite {
  invitationId: string;
  inviteUrl: string;
  role: string;
  expiresAt: string;
}

export interface FamilyAlert {
  id: string;
  event_type: string;
  delivery_status: string;
  analysis_request_id?: string | null;
  created_at: string;
  delivered_at?: string | null;
  message: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `요청 실패: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const csrf = await getCsrf();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(body),
  });
  return readJson<T>(response);
}

export async function getFamilyOverview(): Promise<FamilyOverview> {
  const response = await fetch(`${API_BASE_URL}/api/family`, { credentials: "same-origin" });
  return readJson<FamilyOverview>(response);
}

export async function createFamily(name = "우리 가족"): Promise<FamilyOverview> {
  return postJson<FamilyOverview>("/api/family/group", { name });
}

export async function createFamilyInvite(role: "PARENT" | "CHILD" | "OTHER" = "PARENT"): Promise<FamilyInvite> {
  return postJson<FamilyInvite>("/api/family/invite", { role });
}

export async function acceptFamilyInvite(token: string): Promise<FamilyOverview> {
  return postJson<FamilyOverview>("/api/family/invite/accept", { token });
}

export async function getFamilyAlerts(limit = 20): Promise<FamilyAlert[]> {
  const response = await fetch(`${API_BASE_URL}/api/family/alerts?limit=${limit}`, { credentials: "same-origin" });
  return readJson<FamilyAlert[]>(response);
}
