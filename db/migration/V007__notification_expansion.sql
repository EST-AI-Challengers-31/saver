-- Expansion only. Do not interpret these tables as automatic Kakao-message functionality.

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
    CONSTRAINT fk_notification_preference_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_preference_group FOREIGN KEY (family_group_id) REFERENCES family_group(id) ON DELETE CASCADE
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
    KEY idx_notification_status_created (delivery_status, created_at),
    CONSTRAINT fk_notification_event_recipient FOREIGN KEY (recipient_user_id) REFERENCES app_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_notification_event_group FOREIGN KEY (family_group_id) REFERENCES family_group(id) ON DELETE SET NULL,
    CONSTRAINT fk_notification_event_request FOREIGN KEY (analysis_request_id) REFERENCES analysis_request(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
