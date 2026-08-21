package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Python app.schemas.AnalyzeResponse 와 1:1로 맞춘 응답 DTO입니다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AnalyzeResponseDto(
        @JsonProperty("scan_id") String scanId,
        @JsonProperty("results") List<AnalyzeResultItemDto> results,
        @JsonProperty("policy") String policy,
        @JsonProperty("similarity_threshold") Double similarityThreshold,
        @JsonProperty("vector_provider") String vectorProvider
) {
}
