package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class AnalyzeRequestDto {

    @JsonProperty("packages")
    private List<String> packageNames;

    @JsonProperty("source_type")
    private String sourceType;

    @JsonProperty("source_label")
    private String sourceLabel;

    public AnalyzeRequestDto() {
    }

    public AnalyzeRequestDto(List<String> packageNames) {
        this(packageNames, "PACKAGE", null);
    }

    public AnalyzeRequestDto(List<String> packageNames, String sourceType, String sourceLabel) {
        this.packageNames = packageNames;
        this.sourceType = sourceType;
        this.sourceLabel = sourceLabel;
    }

    public List<String> getPackageNames() {
        return packageNames;
    }

    public void setPackageNames(List<String> packageNames) {
        this.packageNames = packageNames;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public String getSourceLabel() {
        return sourceLabel;
    }

    public void setSourceLabel(String sourceLabel) {
        this.sourceLabel = sourceLabel;
    }
}
