package com.dahum.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class AuthController {

    @GetMapping("/api/me")
    public Map<String, Object> me(Authentication authentication) {
        Map<String, Object> response = new LinkedHashMap<>();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof OAuth2User principal)) {
            response.put("authenticated", false);
            return response;
        }

        response.put("authenticated", true);
        response.put("id", principal.getAttribute("dahum_user_id"));
        response.put("displayName", principal.getAttribute("dahum_display_name"));
        response.put("profileImage", principal.getAttribute("dahum_profile_image"));
        response.put("provider", principal.getAttribute("dahum_provider"));
        return response;
    }

    @GetMapping("/api/auth/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of(
                "token", csrfToken.getToken(),
                "headerName", csrfToken.getHeaderName(),
                "parameterName", csrfToken.getParameterName()
        );
    }
}
