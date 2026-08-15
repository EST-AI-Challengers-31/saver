-- Synthetic demo data only.
-- Never present this as real EST/알약 malware intelligence.

INSERT IGNORE INTO malware_dataset (
    id, source_name, source_version, imported_row_count, usable_row_count, dataset_status
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    'SYNTHETIC_DEMO',
    'v1',
    2,
    2,
    'ACTIVE'
);

INSERT IGNORE INTO malware_record (
    id, dataset_id, malware_name, malware_package, malware_category,
    normalized_app_name, source_name, source_version, vector_id, is_active
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Demo.Trojan.Agent',
    'com.demo.cleaner.bad',
    'Trojan',
    'oo cleaner',
    'SYNTHETIC_DEMO',
    'v1',
    'demo-vector-001',
    1
),
(
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Demo.Riskware.Sample',
    'com.demo.helper.risk',
    'Riskware',
    'smart helper',
    'SYNTHETIC_DEMO',
    'v1',
    'demo-vector-002',
    1
);
