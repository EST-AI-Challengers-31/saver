-- Existing DB migration: identify whose phone/result is being analyzed.
-- protected_device is expansion-ready; MVP can leave target_device_id NULL.

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
    CONSTRAINT fk_protected_device_group FOREIGN KEY (family_group_id) REFERENCES family_group(id) ON DELETE CASCADE,
    CONSTRAINT fk_protected_device_owner FOREIGN KEY (owner_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE analysis_request
    ADD COLUMN IF NOT EXISTS target_family_member_id CHAR(36) NULL AFTER family_group_id,
    ADD COLUMN IF NOT EXISTS target_device_id CHAR(36) NULL AFTER target_family_member_id,
    ADD COLUMN IF NOT EXISTS source_channel ENUM('MOBILE_WEB','DESKTOP_WEB','API') NOT NULL DEFAULT 'MOBILE_WEB' AFTER input_mode;
