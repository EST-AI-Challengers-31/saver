package com.dahum.service;

import com.dahum.dto.AnalyzeRequestDto;
import com.dahum.dto.AnalyzeResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class AiAnalyzeService {

    private final RestTemplate restTemplate;
    private final String aiBaseUrl;

    public AiAnalyzeService(RestTemplate restTemplate,
                             @Value("${ai.base-url}") String aiBaseUrl) {
        this.restTemplate = restTemplate;
        this.aiBaseUrl = aiBaseUrl;
    }

    public AnalyzeResponseDto analyze(List<String> packageNames) {
        String url = aiBaseUrl + "/api/analyze";

        AnalyzeRequestDto requestBody = new AnalyzeRequestDto(packageNames);

        return restTemplate.postForObject(url, requestBody, AnalyzeResponseDto.class);
    }
}