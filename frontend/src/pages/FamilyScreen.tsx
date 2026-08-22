import { useCallback, useEffect, useState } from "react";

import { getMe, startKakaoLogin } from "@/api/auth";
import {
  acceptFamilyInvite,
  createFamily,
  createFamilyInvite,
  getFamilyAlerts,
  getFamilyOverview,
  type FamilyAlert,
  type FamilyOverview,
} from "@/api/family";

interface FamilyScreenProps {
  onBack: () => void;
}

export function FamilyScreen({ onBack }: FamilyScreenProps) {
  const [overview, setOverview] = useState<FamilyOverview | null>(null);
  const [alerts, setAlerts] = useState<FamilyAlert[]>([]);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const me = await getMe();
    setAuthenticated(me.authenticated);
    if (!me.authenticated) return;

    const pendingInvite = localStorage.getItem("dahum_pending_invite");
    if (pendingInvite) {
      try {
        await acceptFamilyInvite(pendingInvite);
        localStorage.removeItem("dahum_pending_invite");
        setMessage("가족 연결이 완료됐어요.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "가족 초대를 처리하지 못했습니다.");
      }
    }

    const [family, recentAlerts] = await Promise.all([
      getFamilyOverview(),
      getFamilyAlerts(20).catch(() => []),
    ]);
    setOverview(family);
    setAlerts(recentAlerts);
  }, []);

  useEffect(() => {
    load().catch((error) => {
      setMessage(error instanceof Error ? error.message : "가족 정보를 불러오지 못했습니다.");
    });
  }, [load]);

  const makeFamily = async () => {
    setBusy(true);
    try {
      setOverview(await createFamily());
      setMessage("가족 공간을 만들었어요. 이제 부모님을 초대할 수 있습니다.");
    } finally {
      setBusy(false);
    }
  };

  const makeInvite = async () => {
    setBusy(true);
    try {
      const invite = await createFamilyInvite("PARENT");
      setInviteUrl(invite.inviteUrl);
      await navigator.clipboard?.writeText(invite.inviteUrl);
      setMessage("부모님 초대 링크를 만들고 복사했어요.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "초대 링크를 만들지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[#f8fafb] flex flex-col h-full min-h-0">
      <div className="bg-white flex h-[56px] items-center gap-[12px] px-[24px] shrink-0 border-b border-[#e2e8f0]">
        <button onClick={onBack} className="size-[24px] text-[#1b3a5c] text-[24px]">‹</button>
        <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">가족 연결</p>
      </div>
      <div className="flex-1 overflow-y-auto px-[24px] py-[24px] space-y-[16px]">
        {message && <div className="bg-[#eef4ff] rounded-[12px] px-[14px] py-[12px] font-['Pretendard'] text-[#1b3a5c] text-[13px]">{message}</div>}

        {authenticated === false && (
          <div className="bg-white rounded-[18px] p-[20px] border border-[#e2e8f0]">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">가족 연결은 로그인이 필요해요</p>
            <p className="font-['Pretendard'] text-[#64748b] text-[13px] mt-[8px]">카카오 계정으로 연결하면 초대와 가족 보안 알림을 사용할 수 있습니다.</p>
            <button onClick={startKakaoLogin} className="mt-[18px] w-full h-[48px] rounded-[12px] bg-[#fee500] font-['Pretendard'] font-bold text-[#181600]">카카오로 로그인</button>
          </div>
        )}

        {authenticated && overview && !overview.connected && (
          <div className="bg-white rounded-[18px] p-[20px] border border-[#e2e8f0]">
            <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">우리 가족 보안 공간 만들기</p>
            <p className="font-['Pretendard'] text-[#64748b] text-[13px] mt-[8px]">가족을 만든 뒤 부모님께 초대 링크를 보내면 서로의 위험 알림을 확인할 수 있어요.</p>
            <button disabled={busy} onClick={makeFamily} className="mt-[18px] w-full h-[48px] rounded-[12px] bg-[#4F8CFF] text-white font-['Pretendard'] font-bold">가족 만들기</button>
          </div>
        )}

        {authenticated && overview?.connected && (
          <>
            <div className="bg-white rounded-[18px] p-[20px] border border-[#e2e8f0]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[18px]">{overview.groupName || "우리 가족"}</p>
                  <p className="font-['Pretendard'] text-[#64748b] text-[12px] mt-[4px]">연결된 가족 {overview.members.length}명</p>
                </div>
                <button disabled={busy} onClick={makeInvite} className="px-[14px] h-[38px] rounded-[10px] bg-[#eef4ff] text-[#4F8CFF] font-['Pretendard'] font-bold text-[13px]">부모님 초대</button>
              </div>
              <div className="mt-[16px] space-y-[10px]">
                {overview.members.map((member) => (
                  <div key={member.member_id} className="flex items-center gap-[12px] rounded-[12px] bg-[#f8fafb] px-[12px] py-[11px]">
                    <div className="size-[36px] rounded-full bg-[#e8eef8] overflow-hidden flex items-center justify-center text-[#64748b] font-bold">
                      {member.profile_image_url ? <img src={member.profile_image_url} className="size-full object-cover" alt="" /> : (member.display_name || "가").slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <p className="font-['Pretendard'] font-semibold text-[#1b3a5c] text-[14px]">{member.display_name || "가족"}</p>
                      <p className="font-['Pretendard'] text-[#94a3b8] text-[11px]">{member.member_role === "PARENT" ? "부모님" : member.member_role === "CHILD" ? "자녀" : "가족"}</p>
                    </div>
                  </div>
                ))}
              </div>
              {inviteUrl && (
                <button onClick={() => navigator.clipboard?.writeText(inviteUrl)} className="mt-[14px] w-full text-left bg-[#fffbe6] rounded-[10px] px-[12px] py-[10px] font-['Pretendard'] text-[#6b5c00] text-[11px] break-all">{inviteUrl}</button>
              )}
            </div>

            <div className="bg-white rounded-[18px] p-[20px] border border-[#e2e8f0]">
              <p className="font-['Pretendard'] font-bold text-[#1b3a5c] text-[17px]">가족 보안 알림</p>
              <div className="mt-[14px] space-y-[10px]">
                {alerts.length === 0 && <p className="font-['Pretendard'] text-[#94a3b8] text-[13px]">아직 새 알림이 없습니다.</p>}
                {alerts.map((alert) => (
                  <div key={alert.id} className="rounded-[12px] bg-[#f8fafb] px-[12px] py-[11px]">
                    <p className="font-['Pretendard'] font-semibold text-[#334155] text-[13px]">{alert.message}</p>
                    <p className="font-['Pretendard'] text-[#94a3b8] text-[11px] mt-[4px]">{String(alert.created_at).replace("T", " ").slice(0, 16)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
