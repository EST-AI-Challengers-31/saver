package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Python app.schemas.AnalyzeRequest 와 1:1로 맞춘 요청 DTO입니다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AnalyzeRequestDto(
        @JsonProperty("packages") List<String> packages,
        @JsonProperty("source_type") String sourceType,
        @JsonProperty("source_label") String sourceLabel
) {
    public AnalyzeRequestDto(List<String> packages) {
        this(packages, "PACKAGE", null);
    }
}
