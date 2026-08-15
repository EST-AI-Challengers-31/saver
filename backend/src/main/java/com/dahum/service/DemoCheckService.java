package com.dahum.service;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.dahum.dto.DemoCheckResponse;

@Service
public class DemoCheckService {
    private final JdbcTemplate jdbcTemplate;

    public DemoCheckService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DemoCheckResponse check(String rawAppName) {
        String appName = rawAppName == null ? "" : rawAppName.trim();
        if (appName.isEmpty()) {
            return new DemoCheckResponse("", "UNKNOWN", "앱 이름을 입력해주세요.", null);
        }

        List<Map<String, Object>> matches = jdbcTemplate.queryForList(
                """
                SELECT malware_name, malware_package, malware_category, source_name
                FROM malware_record
                WHERE is_active = 1
                  AND (LOWER(normalized_app_name) = LOWER(?) OR LOWER(malware_package) = LOWER(?))
                LIMIT 1
                """,
                appName,
                appName);

        if (!matches.isEmpty()) {
            Map<String, Object> match = matches.get(0);
            String evidence = "%s / %s / %s".formatted(
                    String.valueOf(match.get("malware_name")),
                    String.valueOf(match.get("malware_category")),
                    String.valueOf(match.get("source_name")));
            return new DemoCheckResponse(
                    appName,
                    "HIGH",
                    "합성 데모 탐지 DB에서 정확히 일치하는 항목을 찾았습니다. 실제 서비스 판정 데이터가 아닙니다.",
                    evidence);
        }

        return new DemoCheckResponse(
                appName,
                "UNKNOWN",
                "현재 데모 DB에서는 확인되지 않았습니다. 확인되지 않았다는 뜻이지 안전하다는 뜻은 아닙니다.",
                null);
    }
}
