-- Roadmap stage 3: smishing / voice-phishing / financial-fraud analysis history.
-- Raw audio is never stored. Only a redacted text excerpt and analysis result are persisted.

CREATE TABLE IF NOT EXISTS fraud_analysis_request (
    id CHAR(36) NOT NULL,
    requester_user_id CHAR(36) NULL,
    analysis_type ENUM('SMISHING','VOICE_PHISHING','FINANCIAL_FRAUD') NOT NULL,
    input_mode ENUM('TEXT','AUDIO') NOT NULL,
    risk_level ENUM('HIGH','MEDIUM','UNKNOWN') NOT NULL,
    risk_score DECIMAL(5,4) NOT NULL,
    source_excerpt VARCHAR(500) NULL,
    indicators_json LONGTEXT NOT NULL,
    child_message TEXT NOT NULL,
    parent_message TEXT NOT NULL,
    recommended_actions LONGTEXT NOT NULL,
    external_checks_json LONGTEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_fraud_requester_created (requester_user_id, created_at),
    KEY idx_fraud_type_risk_created (analysis_type, risk_level, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
