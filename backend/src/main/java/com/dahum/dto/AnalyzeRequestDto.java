package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AnalyzeRequestDto {

    @JsonProperty("패키지명")
    private List<String> packageNames;

    public AnalyzeRequestDto() {
    }

    public AnalyzeRequestDto(List<String> packageNames) {
        this.packageNames = packageNames;
    }

    public List<String> getPackageNames() {
        return packageNames;
    }

    public void setPackageNames(List<String> packageNames) {
        this.packageNames = packageNames;
    }
}