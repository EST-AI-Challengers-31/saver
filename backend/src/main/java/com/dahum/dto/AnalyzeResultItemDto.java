package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Python app.schemas.AppResult 와 1:1로 맞춘 응답 항목 DTO입니다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AnalyzeResultItemDto(
        @JsonProperty("package_name") String packageName,
        @JsonProperty("display_query") String displayQuery,
        @JsonProperty("risk_level") String riskLevel,
        @JsonProperty("match_type") String matchType,
        @JsonProperty("exact_field") String exactField,
        @JsonProperty("matched") boolean matched,
        @JsonProperty("similarity_score") Double similarityScore,
        @JsonProperty("malware_names") List<String> malwareNames,
        @JsonProperty("malware_categories") List<String> malwareCategories,
        @JsonProperty("matched_examples") List<MatchedExampleDto> matchedExamples,
        @JsonProperty("evidence_summary") String evidenceSummary,
        @JsonProperty("child_message") String childMessage,
        @JsonProperty("parent_message") String parentMessage,
        @JsonProperty("recommended_actions") List<String> recommendedActions,
        @JsonProperty("explanation_method") String explanationMethod,
        @JsonProperty("is_verified_safe") boolean verifiedSafe
) {
}
