package com.dahum.service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OAuthUserService {
    private final JdbcTemplate jdbcTemplate;

    public OAuthUserService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void saveLogin(Authentication authentication) {
        OAuthIdentity identity = identity(authentication);
        List<String> userIds = jdbcTemplate.queryForList(
                "SELECT user_id FROM oauth_identity WHERE provider = ? AND provider_subject = ?",
                String.class, identity.provider(), identity.subject());

        String userId;
        if (userIds.isEmpty()) {
            userId = UUID.randomUUID().toString();
            jdbcTemplate.update("INSERT INTO app_user (id, display_name, profile_image_url) VALUES (?, ?, ?)",
                    userId, identity.displayName(), identity.profileImageUrl());
            jdbcTemplate.update("""
                    INSERT INTO oauth_identity
                        (id, user_id, provider, provider_subject, email, provider_display_name,
                         provider_profile_image_url, last_login_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, UUID.randomUUID().toString(), userId, identity.provider(), identity.subject(),
                    identity.email(), identity.displayName(), identity.profileImageUrl(), Timestamp.from(Instant.now()));
        } else {
            userId = userIds.getFirst();
            jdbcTemplate.update("""
                    UPDATE oauth_identity
                    SET email = ?, provider_display_name = ?, provider_profile_image_url = ?, last_login_at = ?
                    WHERE provider = ? AND provider_subject = ?
                    """, identity.email(), identity.displayName(), identity.profileImageUrl(), Timestamp.from(Instant.now()),
                    identity.provider(), identity.subject());
            jdbcTemplate.update("UPDATE app_user SET display_name = ?, profile_image_url = ? WHERE id = ?",
                    identity.displayName(), identity.profileImageUrl(), userId);
        }
    }

    public OAuthIdentity identity(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken token)
                || !(authentication.getPrincipal() instanceof OAuth2User user)) {
            throw new IllegalArgumentException("OAuth2 login is required");
        }
        String provider = token.getAuthorizedClientRegistrationId().toUpperCase();
        Map<String, Object> attributes = user.getAttributes();
        String subject = String.valueOf(attributes.get("id"));
        Map<?, ?> properties = attributes.get("properties") instanceof Map<?, ?> value ? value : Map.of();
        Map<?, ?> account = attributes.get("kakao_account") instanceof Map<?, ?> value ? value : Map.of();
        Map<?, ?> profile = account.get("profile") instanceof Map<?, ?> value ? value : Map.of();
        String displayName = firstText(profile.get("nickname"), properties.get("nickname"), "사용자");
        String profileImageUrl = firstText(profile.get("profile_image_url"), properties.get("profile_image"), null);
        String email = firstText(account.get("email"), null);
        return new OAuthIdentity(provider, subject, displayName, profileImageUrl, email);
    }

    private String firstText(Object... values) {
        for (Object value : values) {
            if (value != null && !String.valueOf(value).isBlank()) return String.valueOf(value);
        }
        return null;
    }

    public record OAuthIdentity(String provider, String subject, String displayName, String profileImageUrl, String email) {}
}
