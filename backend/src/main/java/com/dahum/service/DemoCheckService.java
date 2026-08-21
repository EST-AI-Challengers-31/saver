package com.dahum.service;

import com.dahum.dto.AnalyzeResponseDto;
import com.dahum.dto.AnalyzeResultItemDto;
import com.dahum.dto.DemoCheckResponse;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 데모 입력도 별도 DB 판정을 하지 않고 Python FastAPI 판정 결과를 사용합니다.
 * 따라서 HIGH / MEDIUM / UNKNOWN 정책은 Python 한 곳에서만 관리됩니다.
 */
@Service
public class DemoCheckService {

    private final AiAnalyzeService aiAnalyzeService;

    public DemoCheckService(AiAnalyzeService aiAnalyzeService) {
        this.aiAnalyzeService = aiAnalyzeService;
    }

    public DemoCheckResponse check(String rawAppName) {
        String appName = rawAppName == null ? "" : rawAppName.trim();
        if (appName.isEmpty()) {
            return new DemoCheckResponse("", "UNKNOWN", "앱 이름을 입력해주세요.", null);
        }

        AnalyzeResponseDto response = aiAnalyzeService.analyze(
                List.of(appName),
                "DEMO_TEXT",
                appName
        );

        if (response == null || response.results() == null || response.results().isEmpty()) {
            return new DemoCheckResponse(
                    appName,
                    "UNKNOWN",
                    "Python AI에서 분석 가능한 결과를 받지 못했습니다.",
                    null
            );
        }

        AnalyzeResultItemDto result = response.results().get(0);
        return new DemoCheckResponse(
                appName,
                result.riskLevel(),
                result.childMessage(),
                result.evidenceSummary()
        );
    }
}
