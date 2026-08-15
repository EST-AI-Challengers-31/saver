-- Existing DB migration: family ownership, invitation, explicit consent.
-- owner_user_id is intentionally nullable here so existing rows can be backfilled safely.

ALTER TABLE family_group
    ADD COLUMN IF NOT EXISTS owner_user_id CHAR(36) NULL AFTER group_name,
    ADD COLUMN IF NOT EXISTS group_status ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE' AFTER owner_user_id;

ALTER TABLE family_member
    ADD COLUMN IF NOT EXISTS member_status ENUM('ACTIVE','LEFT','REMOVED') NOT NULL DEFAULT 'ACTIVE' AFTER member_role,
    ADD COLUMN IF NOT EXISTS joined_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER member_status,
    ADD COLUMN IF NOT EXISTS left_at DATETIME(6) NULL AFTER joined_at,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at;

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
    CONSTRAINT fk_family_invitation_group FOREIGN KEY (family_group_id) REFERENCES family_group(id) ON DELETE CASCADE,
    CONSTRAINT fk_family_invitation_inviter FOREIGN KEY (inviter_user_id) REFERENCES app_user(id),
    CONSTRAINT fk_family_invitation_acceptor FOREIGN KEY (accepted_by_user_id) REFERENCES app_user(id)
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
    CONSTRAINT fk_family_consent_group FOREIGN KEY (family_group_id) REFERENCES family_group(id) ON DELETE CASCADE,
    CONSTRAINT fk_family_consent_user FOREIGN KEY (user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
