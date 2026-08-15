-- Existing DB migration: record whether the result led to actual action.

CREATE TABLE IF NOT EXISTS response_action (
    id CHAR(36) NOT NULL,
    analysis_item_id CHAR(36) NOT NULL,
    actor_user_id CHAR(36) NULL,
    action_type ENUM('GUIDE_VIEWED','GUIDE_COPIED','DELETE_CONFIRMED','CHECK_LATER','ASKED_FAMILY','OTHER') NOT NULL,
    action_note VARCHAR(500) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_response_action_item_created (analysis_item_id, created_at),
    CONSTRAINT fk_response_action_item FOREIGN KEY (analysis_item_id) REFERENCES analysis_item(id) ON DELETE CASCADE,
    CONSTRAINT fk_response_action_actor FOREIGN KEY (actor_user_id) REFERENCES app_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE parent_guide
    ADD COLUMN IF NOT EXISTS model_name VARCHAR(100) NULL AFTER generation_method,
    ADD COLUMN IF NOT EXISTS prompt_version VARCHAR(50) NULL AFTER model_name;
