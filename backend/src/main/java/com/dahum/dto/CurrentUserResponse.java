package com.dahum.dto;

import java.util.List;

public record CurrentUserResponse(
        String id,
        String displayName,
        String profileImageUrl,
        List<String> providers,
        List<FamilySummary> families) {
    public record FamilySummary(String familyId, String familyName, String familyMemberId, String role) {}
}
