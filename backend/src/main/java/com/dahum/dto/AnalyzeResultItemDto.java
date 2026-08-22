package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AnalyzeResultItemDto {

    @JsonProperty("패키지명")
    private String packageName;

    private String childMessage;
    private String parentMessage;

    public AnalyzeResultItemDto() {
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    @JsonProperty("child_message")
    public String getChildMessage() {
        return childMessage;
    }

    @JsonProperty("child_message")
    public void setChildMessage(String childMessage) {
        this.childMessage = childMessage;
    }

    @JsonProperty("parent_message")
    public String getParentMessage() {
        return parentMessage;
    }

    @JsonProperty("parent_message")
    public void setParentMessage(String parentMessage) {
        this.parentMessage = parentMessage;
    }
}