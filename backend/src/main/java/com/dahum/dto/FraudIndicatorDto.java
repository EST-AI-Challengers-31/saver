package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FraudIndicatorDto(
        String code,
        String category,
        String evidence,
        double weight
) {
}
