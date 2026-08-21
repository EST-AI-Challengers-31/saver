package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class AnalyzeResponseDto {

    @JsonProperty("scan_id")
    private String scanId;

    private List<AnalyzeResultItemDto> results;

    private String policy;

    @JsonProperty("similarity_threshold")
    private Double similarityThreshold;

    @JsonProperty("vector_provider")
    private String vectorProvider;

    public AnalyzeResponseDto() {
    }

    public String getScanId() { return scanId; }
    public void setScanId(String scanId) { this.scanId = scanId; }
    public List<AnalyzeResultItemDto> getResults() { return results; }
    public void setResults(List<AnalyzeResultItemDto> results) { this.results = results; }
    public String getPolicy() { return policy; }
    public void setPolicy(String policy) { this.policy = policy; }
    public Double getSimilarityThreshold() { return similarityThreshold; }
    public void setSimilarityThreshold(Double similarityThreshold) { this.similarityThreshold = similarityThreshold; }
    public String getVectorProvider() { return vectorProvider; }
    public void setVectorProvider(String vectorProvider) { this.vectorProvider = vectorProvider; }
}
