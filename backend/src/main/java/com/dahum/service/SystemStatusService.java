package com.dahum.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class SystemStatusService {
    private final JdbcTemplate jdbcTemplate;
    private final RestClient restClient;
    private final String aiBaseUrl;

    public SystemStatusService(
            JdbcTemplate jdbcTemplate,
            RestClient restClient,
            @Value("${dahum.ai.base-url}") String aiBaseUrl) {
        this.jdbcTemplate = jdbcTemplate;
        this.restClient = restClient;
        this.aiBaseUrl = aiBaseUrl;
    }

    public Map<String, Object> status() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("backend", "UP");

        try {
            Integer tables = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()",
                    Integer.class);
            result.put("database", "UP");
            result.put("databaseTables", tables == null ? 0 : tables);
        } catch (Exception exception) {
            result.put("database", "DOWN");
            result.put("databaseTables", 0);
        }

        try {
            restClient.get()
                    .uri(aiBaseUrl + "/health")
                    .retrieve()
                    .toBodilessEntity();
            result.put("ai", "UP");
        } catch (Exception exception) {
            result.put("ai", "DOWN");
        }

        return result;
    }
}
