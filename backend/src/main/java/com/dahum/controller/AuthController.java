package com.dahum.controller;

import java.util.List;
import java.util.Map;

import com.dahum.dto.CurrentUserResponse;
import com.dahum.service.OAuthUserService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final JdbcTemplate jdbcTemplate;
    private final OAuthUserService oAuthUserService;

    public AuthController(JdbcTemplate jdbcTemplate, OAuthUserService oAuthUserService) {
        this.jdbcTemplate = jdbcTemplate;
        this.oAuthUserService = oAuthUserService;
    }

    @GetMapping("/me")
    public CurrentUserResponse me(Authentication authentication) {
        OAuthUserService.OAuthIdentity identity = oAuthUserService.identity(authentication);
        Map<String, Object> user = jdbcTemplate.queryForMap("""
                SELECT u.id, u.display_name, u.profile_image_url
                FROM app_user u
                JOIN oauth_identity oi ON oi.user_id = u.id
                WHERE oi.provider = ? AND oi.provider_subject = ? AND u.user_status = 'ACTIVE'
                """, identity.provider(), identity.subject());
        String userId = String.valueOf(user.get("id"));
        List<String> providers = jdbcTemplate.queryForList(
                "SELECT provider FROM oauth_identity WHERE user_id = ? ORDER BY provider", String.class, userId);
        List<CurrentUserResponse.FamilySummary> families = jdbcTemplate.query("""
                SELECT fg.id, fg.group_name, fm.id, fm.member_role
                FROM family_member fm
                JOIN family_group fg ON fg.id = fm.family_group_id
                WHERE fm.user_id = ? AND fm.member_status = 'ACTIVE' AND fg.group_status = 'ACTIVE'
                ORDER BY fm.joined_at
                """, (rs, rowNum) -> new CurrentUserResponse.FamilySummary(
                rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4)), userId);
        return new CurrentUserResponse(userId, (String) user.get("display_name"),
                (String) user.get("profile_image_url"), providers, families);
    }
}
