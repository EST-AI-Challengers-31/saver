package com.dahum.controller;

import com.dahum.service.FamilyService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @GetMapping
    public Map<String, Object> overview(Authentication authentication) {
        return familyService.overview(currentUserId(authentication));
    }

    @PostMapping("/group")
    public Map<String, Object> createGroup(
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication
    ) {
        String name = body == null ? null : body.get("name");
        return familyService.createGroup(currentUserId(authentication), name);
    }

    @PostMapping("/invite")
    public Map<String, Object> createInvite(
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication
    ) {
        String role = body == null ? null : body.get("role");
        return familyService.createInvitation(currentUserId(authentication), role);
    }

    @PostMapping("/invite/accept")
    public Map<String, Object> acceptInvite(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        try {
            return familyService.acceptInvitation(currentUserId(authentication), body.get("token"));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        }
    }

    @GetMapping("/alerts")
    public List<Map<String, Object>> alerts(
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication
    ) {
        return familyService.alerts(currentUserId(authentication), limit);
    }

    private static String currentUserId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "카카오 로그인이 필요합니다.");
        }
        return authentication.getName();
    }
}
