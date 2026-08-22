package com.dahum.service;

import com.dahum.dto.AnalyzeResponseDto;
import com.dahum.dto.FraudAnalyzeResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FamilyService {

    private static final Set<String> MEMBER_ROLES = Set.of("CHILD", "PARENT", "OTHER");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final JdbcTemplate jdbcTemplate;
    private final String publicBaseUrl;

    public FamilyService(
            JdbcTemplate jdbcTemplate,
            @Value("${dahum.public-base-url}") String publicBaseUrl
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    public Map<String, Object> overview(String userId) {
        Map<String, Object> membership = findMembership(userId);
        if (membership == null) {
            return Map.of("connected", false, "members", List.of());
        }

        String familyGroupId = String.valueOf(membership.get("family_group_id"));
        List<Map<String, Object>> members = jdbcTemplate.queryForList(
                """
                SELECT fm.id AS member_id, fm.member_role, fm.member_status,
                       au.id AS user_id, au.display_name, au.profile_image_url, fm.joined_at
                FROM family_member fm
                JOIN app_user au ON au.id=fm.user_id
                WHERE fm.family_group_id=? AND fm.member_status='ACTIVE'
                ORDER BY fm.joined_at ASC
                """,
                familyGroupId
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("connected", true);
        response.put("familyGroupId", familyGroupId);
        response.put("groupName", membership.get("group_name"));
        response.put("myRole", membership.get("member_role"));
        response.put("members", members);
        return response;
    }

    @Transactional
    public Map<String, Object> createGroup(String userId, String requestedName) {
        Map<String, Object> existing = findMembership(userId);
        if (existing != null) {
            return overview(userId);
        }

        String groupName = requestedName == null ? "" : requestedName.trim();
        if (groupName.isBlank()) {
            groupName = "우리 가족";
        }
        if (groupName.length() > 100) {
            groupName = groupName.substring(0, 100);
        }

        String groupId = UUID.randomUUID().toString();
        jdbcTemplate.update(
                "INSERT INTO family_group (id,group_name,owner_user_id,group_status) VALUES (?,?,?,'ACTIVE')",
                groupId,
                groupName,
                userId
        );
        jdbcTemplate.update(
                """
                INSERT INTO family_member
                (id,family_group_id,user_id,member_role,member_status,joined_at)
                VALUES (?,?,?,'CHILD','ACTIVE',CURRENT_TIMESTAMP(6))
                """,
                UUID.randomUUID().toString(),
                groupId,
                userId
        );
        grantConsent(groupId, userId, "FAMILY_LINK");
        grantConsent(groupId, userId, "ANALYSIS_SHARING");
        grantConsent(groupId, userId, "NOTIFICATION");
        return overview(userId);
    }

    @Transactional
    public Map<String, Object> createInvitation(String userId, String requestedRole) {
        Map<String, Object> membership = requireMembership(userId);
        String familyGroupId = String.valueOf(membership.get("family_group_id"));
        String role = normalizeRole(requestedRole);

        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String tokenHash = sha256(rawToken);
        String invitationId = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(72, ChronoUnit.HOURS);

        jdbcTemplate.update(
                """
                INSERT INTO family_invitation
                (id,family_group_id,inviter_user_id,invited_role,invite_token_hash,invitation_status,expires_at)
                VALUES (?,?,?,?,?,'PENDING',?)
                """,
                invitationId,
                familyGroupId,
                userId,
                role,
                tokenHash,
                Timestamp.from(expiresAt)
        );

        String inviteUrl = publicBaseUrl + "/?invite="
                + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        return Map.of(
                "invitationId", invitationId,
                "inviteUrl", inviteUrl,
                "role", role,
                "expiresAt", expiresAt.toString()
        );
    }

    @Transactional
    public Map<String, Object> acceptInvitation(String userId, String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("초대 토큰이 비어 있습니다.");
        }

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                """
                SELECT id,family_group_id,invited_role,expires_at
                FROM family_invitation
                WHERE invite_token_hash=? AND invitation_status='PENDING'
                LIMIT 1
                """,
                sha256(rawToken.trim())
        );
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("유효한 가족 초대를 찾을 수 없습니다.");
        }

        Map<String, Object> invitation = rows.getFirst();
        Timestamp expiresAt = (Timestamp) invitation.get("expires_at");
        if (expiresAt == null || expiresAt.toInstant().isBefore(Instant.now())) {
            jdbcTemplate.update(
                    "UPDATE family_invitation SET invitation_status='EXPIRED' WHERE id=?",
                    invitation.get("id")
            );
            throw new IllegalArgumentException("가족 초대 링크가 만료되었습니다.");
        }

        String familyGroupId = String.valueOf(invitation.get("family_group_id"));
        String role = normalizeRole(String.valueOf(invitation.get("invited_role")));
        jdbcTemplate.update(
                """
                INSERT INTO family_member
                (id,family_group_id,user_id,member_role,member_status,joined_at)
                VALUES (?,?,?,?,'ACTIVE',CURRENT_TIMESTAMP(6))
                ON DUPLICATE KEY UPDATE
                    member_role=VALUES(member_role), member_status='ACTIVE', left_at=NULL
                """,
                UUID.randomUUID().toString(),
                familyGroupId,
                userId,
                role
        );
        jdbcTemplate.update(
                """
                UPDATE family_invitation
                SET invitation_status='ACCEPTED', accepted_by_user_id=?, accepted_at=CURRENT_TIMESTAMP(6)
                WHERE id=?
                """,
                userId,
                invitation.get("id")
        );
        grantConsent(familyGroupId, userId, "FAMILY_LINK");
        grantConsent(familyGroupId, userId, "ANALYSIS_SHARING");
        grantConsent(familyGroupId, userId, "NOTIFICATION");
        return overview(userId);
    }

    public List<Map<String, Object>> alerts(String userId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        try {
            return jdbcTemplate.queryForList(
                    """
                    SELECT ne.id, ne.event_type, ne.delivery_status, ne.analysis_request_id,
                           ne.created_at, ne.delivered_at,
                           CASE
                             WHEN ne.event_type LIKE 'APP_RISK_HIGH%' THEN '위험 앱이 확인되었습니다.'
                             WHEN ne.event_type LIKE 'APP_RISK_MEDIUM%' THEN '확인이 필요한 앱이 있습니다.'
                             WHEN ne.event_type LIKE 'FRAUD_VOICE_PHISHING_HIGH%' THEN '보이스피싱 위험 신호가 확인되었습니다.'
                             WHEN ne.event_type LIKE 'FRAUD_SMISHING_HIGH%' THEN '스미싱 위험 신호가 확인되었습니다.'
                             WHEN ne.event_type LIKE 'FRAUD_FINANCIAL_FRAUD_HIGH%' THEN '금융사기 위험 신호가 확인되었습니다.'
                             WHEN ne.event_type LIKE 'FRAUD_%_MEDIUM%' THEN '사기 의심 신호를 가족이 확인했습니다.'
                             ELSE '가족 보안 알림이 있습니다.'
                           END AS message
                    FROM notification_event ne
                    WHERE ne.recipient_user_id=? AND ne.channel='WEB'
                    ORDER BY ne.created_at DESC
                    LIMIT ?
                    """,
                    userId,
                    safeLimit
            );
        } catch (DataAccessException exception) {
            return List.of();
        }
    }

    @Transactional
    public void notifyAppRisk(String userId, AnalyzeResponseDto response) {
        if (userId == null || response == null || response.scanId() == null || response.results() == null) {
            return;
        }
        String highest = response.results().stream()
                .map(item -> item.riskLevel())
                .filter(value -> value != null)
                .max((left, right) -> Integer.compare(riskRank(left), riskRank(right)))
                .orElse("UNKNOWN");
        if (riskRank(highest) < 1) {
            return;
        }
        notifyFamilyMembers(userId, "APP_RISK_" + highest, response.scanId());
    }

    @Transactional
    public void notifyFraudRisk(String userId, FraudAnalyzeResponseDto response) {
        if (userId == null || response == null || riskRank(response.riskLevel()) < 1) {
            return;
        }
        String eventType = "FRAUD_" + response.analysisType() + "_" + response.riskLevel();
        notifyFamilyMembers(userId, eventType, null);
    }

    private void notifyFamilyMembers(String actorUserId, String eventType, String analysisRequestId) {
        Map<String, Object> membership = findMembership(actorUserId);
        if (membership == null) {
            return;
        }
        String groupId = String.valueOf(membership.get("family_group_id"));
        List<String> recipients = jdbcTemplate.query(
                """
                SELECT user_id FROM family_member
                WHERE family_group_id=? AND member_status='ACTIVE' AND user_id<>?
                """,
                (rs, rowNum) -> rs.getString("user_id"),
                groupId,
                actorUserId
        );
        for (String recipient : recipients) {
            jdbcTemplate.update(
                    """
                    INSERT INTO notification_event
                    (id,recipient_user_id,family_group_id,analysis_request_id,channel,event_type,delivery_status,delivered_at)
                    VALUES (?,?,?,?, 'WEB', ?, 'SENT', CURRENT_TIMESTAMP(6))
                    """,
                    UUID.randomUUID().toString(),
                    recipient,
                    groupId,
                    analysisRequestId,
                    eventType
            );
        }
    }

    private Map<String, Object> findMembership(String userId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                """
                SELECT fm.family_group_id, fm.member_role, fg.group_name, fg.owner_user_id
                FROM family_member fm
                JOIN family_group fg ON fg.id=fm.family_group_id
                WHERE fm.user_id=? AND fm.member_status='ACTIVE' AND fg.group_status='ACTIVE'
                ORDER BY fm.joined_at ASC
                LIMIT 1
                """,
                userId
        );
        return rows.isEmpty() ? null : rows.getFirst();
    }

    private Map<String, Object> requireMembership(String userId) {
        Map<String, Object> membership = findMembership(userId);
        if (membership == null) {
            throw new IllegalStateException("먼저 가족 그룹을 만들어 주세요.");
        }
        return membership;
    }

    private void grantConsent(String familyGroupId, String userId, String consentType) {
        jdbcTemplate.update(
                """
                INSERT INTO family_consent
                (id,family_group_id,user_id,consent_type,consent_version,consent_status,granted_at)
                VALUES (?,?,?,?, 'v1', 'GRANTED', CURRENT_TIMESTAMP(6))
                ON DUPLICATE KEY UPDATE
                    consent_status='GRANTED', granted_at=CURRENT_TIMESTAMP(6), revoked_at=NULL
                """,
                UUID.randomUUID().toString(),
                familyGroupId,
                userId,
                consentType
        );
    }

    private static int riskRank(String risk) {
        if ("HIGH".equalsIgnoreCase(risk)) {
            return 2;
        }
        if ("MEDIUM".equalsIgnoreCase(risk)) {
            return 1;
        }
        return 0;
    }

    private static String normalizeRole(String requestedRole) {
        String role = requestedRole == null ? "PARENT" : requestedRole.trim().toUpperCase(Locale.ROOT);
        return MEMBER_ROLES.contains(role) ? role : "PARENT";
    }

    private static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
