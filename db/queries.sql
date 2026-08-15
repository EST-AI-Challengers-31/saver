-- MariaDB query examples for Spring Boot repository/service implementation.
-- These are reference queries, not a replacement for repository tests.

-- =========================================================
-- AUTH
-- =========================================================

-- 1) Find a user by social-login subject.
SELECT
    u.id,
    u.display_name,
    u.profile_image_url,
    u.user_status,
    oi.provider,
    oi.provider_subject,
    oi.email
FROM oauth_identity oi
JOIN app_user u ON u.id = oi.user_id
WHERE oi.provider = ?
  AND oi.provider_subject = ?
LIMIT 1;

-- 2) List login providers connected to a user.
SELECT provider, email, last_login_at
FROM oauth_identity
WHERE user_id = ?
ORDER BY provider;

-- =========================================================
-- FAMILY
-- =========================================================

-- 3) Families and role for current user.
SELECT
    fg.id AS family_group_id,
    fg.group_name,
    fm.id AS family_member_id,
    fm.member_role,
    fm.member_status
FROM family_member fm
JOIN family_group fg ON fg.id = fm.family_group_id
WHERE fm.user_id = ?
  AND fm.member_status = 'ACTIVE'
  AND fg.group_status = 'ACTIVE'
ORDER BY fm.joined_at ASC;

-- 4) Active members of one family.
SELECT
    fm.id AS family_member_id,
    fm.member_role,
    u.id AS user_id,
    u.display_name,
    u.profile_image_url
FROM family_member fm
JOIN app_user u ON u.id = fm.user_id
WHERE fm.family_group_id = ?
  AND fm.member_status = 'ACTIVE'
ORDER BY fm.member_role, fm.joined_at;

-- 5) Acceptable invitation lookup uses a HASH of the raw token.
-- Never store/search the raw invite token itself.
SELECT id, family_group_id, inviter_user_id, invited_role, expires_at
FROM family_invitation
WHERE invite_token_hash = ?
  AND invitation_status = 'PENDING'
  AND expires_at > CURRENT_TIMESTAMP(6)
LIMIT 1;

-- =========================================================
-- MALWARE DETECTION
-- =========================================================

-- 6) Strongest match: exact package match.
SELECT id, malware_name, malware_package, malware_category, normalized_app_name, vector_id
FROM malware_record
WHERE is_active = 1
  AND malware_package = ?
LIMIT 1;

-- 7) Fallback exact normalized app-name match.
SELECT id, malware_name, malware_package, malware_category, normalized_app_name, vector_id
FROM malware_record
WHERE is_active = 1
  AND normalized_app_name = ?;

-- IMPORTANT:
-- Zero rows from the detection DB NEVER means SAFE.
-- Application must return UNKNOWN unless there is supported evidence.

-- =========================================================
-- ANALYSIS / FAMILY HISTORY
-- =========================================================

-- 8) One analysis request with target family member and item summaries.
SELECT
    ar.id AS request_id,
    ar.status,
    ar.input_mode,
    ar.source_channel,
    ar.created_at,
    target_user.display_name AS target_display_name,
    target_member.member_role AS target_role,
    ai.id AS item_id,
    ai.input_app_name,
    ai.risk_level,
    ai.match_type,
    ai.similarity_score,
    ai.malware_name,
    ai.malware_category,
    ai.easy_explanation,
    ai.recommended_actions
FROM analysis_request ar
LEFT JOIN family_member target_member ON target_member.id = ar.target_family_member_id
LEFT JOIN app_user target_user ON target_user.id = target_member.user_id
JOIN analysis_item ai ON ai.analysis_request_id = ar.id
WHERE ar.id = ?
ORDER BY ai.created_at ASC;

-- 9) Evidence for an analysis item.
SELECT evidence_type, evidence_message, source_reference, created_at
FROM analysis_evidence
WHERE analysis_item_id = ?
ORDER BY created_at ASC;

-- 10) Latest parent guide.
SELECT guide_text, generation_method, model_name, prompt_version, copied_at, created_at
FROM parent_guide
WHERE analysis_request_id = ?
ORDER BY created_at DESC
LIMIT 1;

-- 11) Recent analysis history visible in a family.
-- Authorization must still be checked in the service layer before executing/returning it.
SELECT
    ar.id,
    ar.status,
    ar.created_at,
    target_user.display_name AS target_display_name,
    MAX(CASE ai.risk_level WHEN 'HIGH' THEN 3 WHEN 'MEDIUM' THEN 2 ELSE 1 END) AS max_risk_rank
FROM analysis_request ar
LEFT JOIN family_member target_member ON target_member.id = ar.target_family_member_id
LEFT JOIN app_user target_user ON target_user.id = target_member.user_id
LEFT JOIN analysis_item ai ON ai.analysis_request_id = ar.id
WHERE ar.family_group_id = ?
GROUP BY ar.id, ar.status, ar.created_at, target_user.display_name
ORDER BY ar.created_at DESC
LIMIT ?;

-- 12) Response actions for measuring whether guidance led to action.
SELECT action_type, actor_user_id, action_note, created_at
FROM response_action
WHERE analysis_item_id = ?
ORDER BY created_at ASC;
