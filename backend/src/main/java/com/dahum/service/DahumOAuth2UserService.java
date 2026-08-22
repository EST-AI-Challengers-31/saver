package com.dahum.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DahumOAuth2UserService extends DefaultOAuth2UserService {

    private final JdbcTemplate jdbcTemplate;

    public DahumOAuth2UserService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User providerUser = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        if (!"kakao".equalsIgnoreCase(registrationId)) {
            return providerUser;
        }

        Map<String, Object> attributes = providerUser.getAttributes();
        String providerSubject = stringValue(attributes.get("id"));
        if (providerSubject.isBlank()) {
            throw new OAuth2AuthenticationException("Kakao user id is missing");
        }

        Map<String, Object> account = mapValue(attributes.get("kakao_account"));
        Map<String, Object> profile = mapValue(account.get("profile"));
        Map<String, Object> properties = mapValue(attributes.get("properties"));

        String nickname = firstNonBlank(
                stringValue(profile.get("nickname")),
                stringValue(properties.get("nickname")),
                "카카오 사용자"
        );
        String profileImage = firstNonBlank(
                stringValue(profile.get("profile_image_url")),
                stringValue(profile.get("thumbnail_image_url")),
                stringValue(properties.get("profile_image")),
                ""
        );
        String email = stringValue(account.get("email"));

        List<String> existingUserIds = jdbcTemplate.query(
                "SELECT user_id FROM oauth_identity WHERE provider='KAKAO' AND provider_subject=? LIMIT 1",
                (rs, rowNum) -> rs.getString("user_id"),
                providerSubject
        );

        String userId;
        if (existingUserIds.isEmpty()) {
            userId = UUID.randomUUID().toString();
            jdbcTemplate.update(
                    "INSERT INTO app_user (id,display_name,profile_image_url,user_status) VALUES (?,?,?,'ACTIVE')",
                    userId,
                    nickname,
                    profileImage.isBlank() ? null : profileImage
            );
            jdbcTemplate.update(
                    """
                    INSERT INTO oauth_identity
                    (id,user_id,provider,provider_subject,email,provider_display_name,provider_profile_image_url,last_login_at)
                    VALUES (?,?, 'KAKAO', ?, ?, ?, ?, CURRENT_TIMESTAMP(6))
                    """,
                    UUID.randomUUID().toString(),
                    userId,
                    providerSubject,
                    email.isBlank() ? null : email,
                    nickname,
                    profileImage.isBlank() ? null : profileImage
            );
        } else {
            userId = existingUserIds.getFirst();
            jdbcTemplate.update(
                    """
                    UPDATE oauth_identity
                    SET email=?, provider_display_name=?, provider_profile_image_url=?,
                        last_login_at=CURRENT_TIMESTAMP(6), updated_at=CURRENT_TIMESTAMP(6)
                    WHERE provider='KAKAO' AND provider_subject=?
                    """,
                    email.isBlank() ? null : email,
                    nickname,
                    profileImage.isBlank() ? null : profileImage,
                    providerSubject
            );
            jdbcTemplate.update(
                    """
                    UPDATE app_user
                    SET display_name=COALESCE(NULLIF(?,''),display_name),
                        profile_image_url=COALESCE(NULLIF(?,''),profile_image_url),
                        user_status='ACTIVE'
                    WHERE id=?
                    """,
                    nickname,
                    profileImage,
                    userId
            );
        }

        Map<String, Object> enriched = new LinkedHashMap<>(attributes);
        enriched.put("dahum_user_id", userId);
        enriched.put("dahum_display_name", nickname);
        enriched.put("dahum_profile_image", profileImage);
        enriched.put("dahum_provider", "KAKAO");

        return new DefaultOAuth2User(providerUser.getAuthorities(), enriched, "dahum_user_id");
    }

    private static String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private static Map<String, Object> mapValue(Object value) {
        if (!(value instanceof Map<?, ?> raw)) {
            return Map.of();
        }
        Map<String, Object> converted = new LinkedHashMap<>();
        raw.forEach((key, item) -> converted.put(String.valueOf(key), item));
        return converted;
    }
}
