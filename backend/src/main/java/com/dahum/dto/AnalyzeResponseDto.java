package com.dahum.dto;

import java.util.List;

public class AnalyzeResponseDto {

    private List<AnalyzeResultItemDto> results;

    public AnalyzeResponseDto() {
    }

    public AnalyzeResponseDto(List<AnalyzeResultItemDto> results) {
        this.results = results;
    }

    public List<AnalyzeResultItemDto> getResults() {
        return results;
    }

    public void setResults(List<AnalyzeResultItemDto> results) {
        this.results = results;
    }
}