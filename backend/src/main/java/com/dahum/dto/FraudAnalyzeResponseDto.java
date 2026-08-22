package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FraudAnalyzeResponseDto(
        @JsonProperty("analysis_id") String analysisId,
        @JsonProperty("analysis_type") String analysisType,
        @JsonProperty("risk_level") String riskLevel,
        @JsonProperty("risk_score") double riskScore,
        List<FraudIndicatorDto> indicators,
        List<String> urls,
        String transcript,
        @JsonProperty("child_message") String childMessage,
        @JsonProperty("parent_message") String parentMessage,
        @JsonProperty("recommended_actions") List<String> recommendedActions,
        @JsonProperty("external_checks") Map<String, Object> externalChecks
) {
}
