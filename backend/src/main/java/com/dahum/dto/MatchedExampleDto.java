package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Python app.schemas.MatchedExample 과 1:1로 맞춘 DTO입니다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MatchedExampleDto(
        @JsonProperty("malware_name") String malwareName,
        @JsonProperty("malware_package") String malwarePackage,
        @JsonProperty("malware_category") String malwareCategory,
        @JsonProperty("score") double score
) {
}
