-- Existing DB migration: introduce Kakao/Google social identities.
-- Keep legacy external_auth_subject temporarily until data migration is complete.

ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(1000) NULL AFTER display_name,
    ADD COLUMN IF NOT EXISTS user_status ENUM('ACTIVE','WITHDRAWN','BLOCKED') NOT NULL DEFAULT 'ACTIVE' AFTER profile_image_url,
    ADD COLUMN IF NOT EXISTS withdrawn_at DATETIME(6) NULL AFTER updated_at;

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
    CONSTRAINT fk_oauth_identity_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
