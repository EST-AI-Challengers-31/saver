-- Existing DB migration: enrich audit metadata without storing secrets/raw screenshots.

ALTER TABLE audit_event
    ADD COLUMN IF NOT EXISTS actor_user_id CHAR(36) NULL AFTER id,
    ADD COLUMN IF NOT EXISTS target_type VARCHAR(80) NULL AFTER event_type,
    ADD COLUMN IF NOT EXISTS target_id VARCHAR(100) NULL AFTER target_type,
    ADD COLUMN IF NOT EXISTS detail_json LONGTEXT NULL AFTER event_message;
