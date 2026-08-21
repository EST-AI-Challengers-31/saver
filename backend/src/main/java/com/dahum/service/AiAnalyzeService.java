package com.dahum.service;

import com.dahum.dto.AnalyzeRequestDto;
import com.dahum.dto.AnalyzeResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class AiAnalyzeService {

    private final RestClient restClient;
    private final String aiBaseUrl;

    public AiAnalyzeService(
            RestClient restClient,
            @Value("${dahum.ai.base-url}") String aiBaseUrl
    ) {
        this.restClient = restClient;
        this.aiBaseUrl = aiBaseUrl;
    }

    public AnalyzeResponseDto analyze(List<String> queries, String sourceType, String sourceLabel) {
        AnalyzeRequestDto requestBody = new AnalyzeRequestDto(queries, sourceType, sourceLabel);
        return restClient
                .post()
                .uri(aiBaseUrl + "/api/v1/analyze/packages")
                .body(requestBody)
                .retrieve()
                .body(AnalyzeResponseDto.class);
    }

    public List<Map<String, Object>> getScanHistory(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        List<Map<String, Object>> response = restClient
                .get()
                .uri(aiBaseUrl + "/api/scans?limit=" + safeLimit)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
        return response == null ? List.of() : response;
    }

    public Map<String, Object> getScanDetail(String scanId) {
        try {
            return restClient
                    .get()
                    .uri(aiBaseUrl + "/api/scans/{scanId}", scanId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });
        } catch (HttpClientErrorException.NotFound ignored) {
            return null;
        }
    }
}
