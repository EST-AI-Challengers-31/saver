-- Dahum final-direction MariaDB schema
-- Target: MariaDB 11.4+ / utf8mb4
-- UUID values are generated in the application and stored as CHAR(36).
-- This file represents the fresh-install FINAL DIRECTION schema.
-- Do not edit a running production DB by re-running this file.
-- Existing environments must evolve through db/migration (and later Flyway).

SET NAMES utf8mb4;

-- =========================================================
-- 1. USER / SOCIAL LOGIN
-- =========================================================

CREATE TABLE IF NOT EXISTS app_user (
    id CHAR(36) NOT NULL,
    display_name VARCHAR(100) NULL,
    profile_image_url VARCHAR(1000) NULL,
    user_status ENUM('ACTIVE','WITHDRAWN','BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    withdrawn_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_app_user_status (user_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS oauth_identity (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    provider ENUM('KAKAO','GOOGLE') NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    email VARCHAR(320) NULL,
    provider_display_name VARCHAR(100) NULL,
    provider_profile_image_url VARCHAR(1000) NULL,
    last_login_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_oauth_provider_subject (provider, provider_subject),
    UNIQUE KEY uq_oauth_user_provider (user_id, provider),
    KEY idx_oauth_identity_user (user_id),
    CONSTRAINT fk_oauth_identity_user
        FOREIGN KEY (user_id) REFERENCES app_user(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 2. FAMILY / PARENT-CHILD RELATIONSHIP
-- Role belongs to a family membership, NOT globally to the user.
-- =========================================================

CREATE TABLE IF NOT EXISTS family_group (
    id CHAR(36) NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    owner_user_id CHAR(36) NOT NULL,
    group_status ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_family_group_owner (owner_user_id),
    CONSTRAINT fk_family_group_owner
        FOREIGN KEY (owner_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS family_member (
    id CHAR(36) NOT NULL,
    family_group_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    member_role ENUM('CHILD','PARENT','OTHER') NOT NULL,
    member_status ENUM('ACTIVE','LEFT','REMOVED') NOT NULL DEFAULT 'ACTIVE',
    joined_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    left_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_family_member_group_user (family_group_id, user_id),
    KEY idx_family_member_user_status (user_id, member_status),
    KEY idx_family_member_group_role (family_group_id, member_role, member_status),
    CONSTRAINT fk_family_member_group
        FOREIGN KEY (family_group_id) REFERENCES family_group(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_family_member_user
        FOREIGN KEY (user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS family_invitation (
    id CHAR(36) NOT NULL,
    family_group_id CHAR(36) NOT NULL,
    inviter_user_id CHAR(36) NOT NULL,
    invited_role ENUM('CHILD','PARENT','OTHER') NOT NULL,
    invite_token_hash CHAR(64) NOT NULL,
    invitation_status ENUM('PENDING','ACCEPTED','EXPIRED','REVOKED') NOT NULL DEFAULT 'PENDING',
    expires_at DATETIME(6) NOT NULL,
    accepted_by_user_id CHAR(36) NULL,
    accepted_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_family_invitation_token_hash (invite_token_hash),
    KEY idx_family_invitation_group_status (family_group_id, invitation_status),
    KEY idx_family_invitation_expiry (invitation_status, expires_at),
    CONSTRAINT fk_family_invitation_group
        FOREIGN KEY (family_group_id) REFERENCES family_group(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_family_invitation_inviter
        FOREIGN KEY (inviter_user_id) REFERENCES app_user(id),
    CONSTRAINT fk_family_invitation_acceptor
        FOREIGN KEY (accepted_by_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS family_consent (
    id CHAR(36) NOT NULL,
    family_group_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    consent_type ENUM('FAMILY_LINK','ANALYSIS_SHARING','NOTIFICATION') NOT NULL,
    consent_version VARCHAR(50) NOT NULL,
    consent_status ENUM('GRANTED','REVOKED') NOT NULL,
    granted_at DATETIME(6) NULL,
    revoked_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_family_consent (family_group_id, user_id, consent_type, consent_version),
    KEY idx_family_consent_user (user_id, consent_status),
    CONSTRAINT fk_family_consent_group
        FOREIGN KEY (family_group_id) REFERENCES family_group(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_family_consent_user
        FOREIGN KEY (user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 3. FUTURE DEVICE MODEL
-- MVP does NOT require device registration. This table is for expansion.
-- Do not store IMEI, phone number, address book or other unnecessary identifiers.
-- =========================================================

CREATE TABLE IF NOT EXISTS protected_device (
    id CHAR(36) NOT NULL,
    family_group_id CHAR(36) NOT NULL,
    owner_user_id CHAR(36) NOT NULL,
    device_label VARCHAR(100) NOT NULL,
    platform ENUM('ANDROID','IOS','OTHER') NOT NULL DEFAULT 'ANDROID',
    device_status ENUM('ACTIVE','REMOVED') NOT NULL DEFAULT 'ACTIVE',
    last_checked_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_protected_device_owner (owner_user_id, device_status),
    KEY idx_protected_device_group (family_group_id, device_status),
    CONSTRAINT fk_protected_device_group
        FOREIGN KEY (family_group_id) REFERENCES family_group(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_protected_device_owner
        FOREIGN KEY (owner_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. MALWARE DATASET / DETECTION DB
-- =========================================================

CREATE TABLE IF NOT EXISTS malware_dataset (
    id CHAR(36) NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    source_version VARCHAR(100) NOT NULL,
    source_period_start DATE NULL,
    source_period_end DATE NULL,
    imported_row_count INT UNSIGNED NULL,
    usable_row_count INT UNSIGNED NULL,
    dataset_status ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    imported_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_malware_dataset_source_version (source_name, source_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS malware_record (
    id CHAR(36) NOT NULL,
    dataset_id CHAR(36) NULL,
    malware_name VARCHAR(255) NULL,
    malware_package VARCHAR(255) NULL,
    malware_category VARCHAR(100) NULL,
    normalized_app_name VARCHAR(255) NULL,
    source_name VARCHAR(100) NOT NULL,
    source_version VARCHAR(100) NULL,
    vector_id VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_malware_record_dataset (dataset_id),
    KEY idx_malware_record_package_active (malware_package, is_active),
    KEY idx_malware_record_normalized_name_active (normalized_app_name, is_active),
    KEY idx_malware_record_category (malware_category),
    CONSTRAINT fk_malware_record_dataset
        FOREIGN KEY (dataset_id) REFERENCES malware_dataset(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. ANALYSIS
-- =========================================================

CREATE TABLE IF NOT EXISTS analysis_request (
    id CHAR(36) NOT NULL,
    requester_user_id CHAR(36) NULL,
    family_group_id CHAR(36) NULL,
    target_family_member_id CHAR(36) NULL,
    target_device_id CHAR(36) NULL,
    input_mode ENUM('IMAGE','DIRECT_TEXT','MIXED') NOT NULL,
    source_channel ENUM('MOBILE_WEB','DESKTOP_WEB','API') NOT NULL DEFAULT 'MOBILE_WEB',
    status ENUM('RECEIVED','PROCESSING','COMPLETED','FAILED') NOT NULL,
    image_stored TINYINT(1) NOT NULL DEFAULT 0,
    error_code VARCHAR(50) NULL,
    error_message VARCHAR(500) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    completed_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_analysis_request_requester_created (requester_user_id, created_at),
    KEY idx_analysis_request_family_created (family_group_id, created_at),
    KEY idx_analysis_request_target_created (target_family_member_id, created_at),
    KEY idx_analysis_request_status_created (status, created_at),
    CONSTRAINT fk_analysis_request_user
        FOREIGN KEY (requester_user_id) REFERENCES app_user(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_analysis_request_group
        FOREIGN KEY (family_group_id) REFERENCES family_group(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_analysis_request_target_member
        FOREIGN KEY (target_family_member_id) REFERENCES family_member(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_analysis_request_target_device
        FOREIGN KEY (target_device_id) REFERENCES protected_device(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analysis_item (
    id CHAR(36) NOT NULL,
    analysis_request_id CHAR(36) NOT NULL,
    input_app_name VARCHAR(255) NOT NULL,
    normalized_app_name VARCHAR(255) NOT NULL,
    package_name VARCHAR(255) NULL,
    risk_level ENUM('HIGH','MEDIUM','UNKNOWN') NOT NULL,
    match_type ENUM('EXACT_PACKAGE','EXACT_APP_NAME','VECTOR_SIMILARITY','NO_MATCH') NOT NULL,
    similarity_score DECIMAL(7,6) NULL,
    matched_malware_record_id CHAR(36) NULL,
    malware_name VARCHAR(255) NULL,
    malware_category VARCHAR(100) NULL,
    easy_explanation TEXT NULL,
    recommended_actions TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_analysis_item_request (analysis_request_id),
    KEY idx_analysis_item_risk (risk_level),
    KEY idx_analysis_item_match_record (matched_malware_record_id),
    CONSTRAINT fk_analysis_item_request
        FOREIGN KEY (analysis_request_id) REFERENCES analysis_request(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_analysis_item_malware
        FOREIGN KEY (matched_malware_record_id) REFERENCES malware_record(id)
        ON DELETE SET NULL,
    CONSTRAINT ck_analysis_item_similarity
        CHECK (similarity_score IS NULL OR (similarity_score >= 0 AND similarity_score <= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analysis_evidence (
    id CHAR(36) NOT NULL,
    analysis_item_id CHAR(36) NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    evidence_message VARCHAR(1000) NOT NULL,
    source_reference VARCHAR(500) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_analysis_evidence_item (analysis_item_id),
    CONSTRAINT fk_analysis_evidence_item
        FOREIGN KEY (analysis_item_id) REFERENCES analysis_item(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parent_guide (
    id CHAR(36) NOT NULL,
    analysis_request_id CHAR(36) NOT NULL,
    guide_text TEXT NOT NULL,
    generation_method ENUM('LLM','TEMPLATE') NOT NULL,
    model_name VARCHAR(100) NULL,
    prompt_version VARCHAR(50) NULL,
    copied_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_parent_guide_request_created (analysis_request_id, created_at),
    CONSTRAINT fk_parent_guide_request
        FOREIGN KEY (analysis_request_id) REFERENCES analysis_request(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User/family action after a result. Useful for measuring whether detection leads to action.
CREATE TABLE IF NOT EXISTS response_action (
    id CHAR(36) NOT NULL,
    analysis_item_id CHAR(36) NOT NULL,
    actor_user_id CHAR(36) NULL,
    action_type ENUM('GUIDE_VIEWED','GUIDE_COPIED','DELETE_CONFIRMED','CHECK_LATER','ASKED_FAMILY','OTHER') NOT NULL,
    action_note VARCHAR(500) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_response_action_item_created (analysis_item_id, created_at),
    KEY idx_response_action_actor_created (actor_user_id, created_at),
    CONSTRAINT fk_response_action_item
        FOREIGN KEY (analysis_item_id) REFERENCES analysis_item(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_response_action_actor
        FOREIGN KEY (actor_user_id) REFERENCES app_user(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 6. FUTURE NOTIFICATION MODEL
-- Automatic Kakao/push delivery is NOT part of the MVP unless separately implemented/approved.
-- =========================================================

CREATE TABLE IF NOT EXISTS notification_preference (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    family_group_id CHAR(36) NULL,
    channel ENUM('WEB','KAKAO','PUSH','EMAIL') NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_notification_preference (user_id, family_group_id, channel),
    CONSTRAINT fk_notification_preference_user
        FOREIGN KEY (user_id) REFERENCES app_user(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notification_preference_group
        FOREIGN KEY (family_group_id) REFERENCES family_group(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_event (
    id CHAR(36) NOT NULL,
    recipient_user_id CHAR(36) NULL,
    family_group_id CHAR(36) NULL,
    analysis_request_id CHAR(36) NULL,
    channel ENUM('WEB','KAKAO','PUSH','EMAIL') NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    delivery_status ENUM('PENDING','SENT','FAILED','SKIPPED') NOT NULL DEFAULT 'PENDING',
    provider_message_id VARCHAR(255) NULL,
    error_code VARCHAR(100) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    delivered_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_notification_recipient_created (recipient_user_id, created_at),
    KEY idx_notification_status_created (delivery_status, created_at),
    CONSTRAINT fk_notification_event_recipient
        FOREIGN KEY (recipient_user_id) REFERENCES app_user(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_notification_event_group
        FOREIGN KEY (family_group_id) REFERENCES family_group(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_notification_event_request
        FOREIGN KEY (analysis_request_id) REFERENCES analysis_request(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. AUDIT / TRACE
-- Keep this metadata-oriented. Do not dump raw screenshots, tokens or secrets here.
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_event (
    id CHAR(36) NOT NULL,
    actor_user_id CHAR(36) NULL,
    request_id CHAR(36) NULL,
    event_type VARCHAR(80) NOT NULL,
    target_type VARCHAR(80) NULL,
    target_id VARCHAR(100) NULL,
    event_message VARCHAR(1000) NULL,
    detail_json LONGTEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_audit_event_actor_created (actor_user_id, created_at),
    KEY idx_audit_event_request (request_id),
    KEY idx_audit_event_type_created (event_type, created_at),
    CONSTRAINT fk_audit_event_actor
        FOREIGN KEY (actor_user_id) REFERENCES app_user(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_audit_event_request
        FOREIGN KEY (request_id) REFERENCES analysis_request(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
