package com.dahum.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class AnalyzeResultItemDto {
    @JsonProperty("package_name") private String packageName;
    @JsonProperty("display_query") private String displayQuery;
    @JsonProperty("risk_level") private String riskLevel;
    @JsonProperty("match_type") private String matchType;
    @JsonProperty("exact_field") private String exactField;
    private boolean matched;
    @JsonProperty("similarity_score") private Double similarityScore;
    @JsonProperty("malware_names") private List<String> malwareNames;
    @JsonProperty("malware_categories") private List<String> malwareCategories;
    @JsonProperty("matched_examples") private List<Map<String, Object>> matchedExamples;
    @JsonProperty("evidence_summary") private String evidenceSummary;
    @JsonProperty("child_message") private String childMessage;
    @JsonProperty("parent_message") private String parentMessage;
    @JsonProperty("recommended_actions") private List<String> recommendedActions;
    @JsonProperty("explanation_method") private String explanationMethod;
    @JsonProperty("is_verified_safe") private boolean verifiedSafe;

    public AnalyzeResultItemDto() {}
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public String getDisplayQuery() { return displayQuery; }
    public void setDisplayQuery(String displayQuery) { this.displayQuery = displayQuery; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getMatchType() { return matchType; }
    public void setMatchType(String matchType) { this.matchType = matchType; }
    public String getExactField() { return exactField; }
    public void setExactField(String exactField) { this.exactField = exactField; }
    public boolean isMatched() { return matched; }
    public void setMatched(boolean matched) { this.matched = matched; }
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    public List<String> getMalwareNames() { return malwareNames; }
    public void setMalwareNames(List<String> malwareNames) { this.malwareNames = malwareNames; }
    public List<String> getMalwareCategories() { return malwareCategories; }
    public void setMalwareCategories(List<String> malwareCategories) { this.malwareCategories = malwareCategories; }
    public List<Map<String, Object>> getMatchedExamples() { return matchedExamples; }
    public void setMatchedExamples(List<Map<String, Object>> matchedExamples) { this.matchedExamples = matchedExamples; }
    public String getEvidenceSummary() { return evidenceSummary; }
    public void setEvidenceSummary(String evidenceSummary) { this.evidenceSummary = evidenceSummary; }
    public String getChildMessage() { return childMessage; }
    public void setChildMessage(String childMessage) { this.childMessage = childMessage; }
    public String getParentMessage() { return parentMessage; }
    public void setParentMessage(String parentMessage) { this.parentMessage = parentMessage; }
    public List<String> getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(List<String> recommendedActions) { this.recommendedActions = recommendedActions; }
    public String getExplanationMethod() { return explanationMethod; }
    public void setExplanationMethod(String explanationMethod) { this.explanationMethod = explanationMethod; }
    public boolean isVerifiedSafe() { return verifiedSafe; }
    public void setVerifiedSafe(boolean verifiedSafe) { this.verifiedSafe = verifiedSafe; }
}
