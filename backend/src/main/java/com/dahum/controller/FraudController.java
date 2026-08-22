package com.dahum.controller;

import com.dahum.dto.FraudAnalyzeResponseDto;
import com.dahum.service.AiFraudService;
import com.dahum.service.FamilyService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;

@RestController
@RequestMapping("/api/fraud")
public class FraudController {

    private static final Set<String> ANALYSIS_TYPES = Set.of(
            "SMISHING", "VOICE_PHISHING", "FINANCIAL_FRAUD"
    );
    private static final long MAX_AUDIO_BYTES = 25L * 1024L * 1024L;

    private final AiFraudService aiFraudService;
    private final FamilyService familyService;

    public FraudController(AiFraudService aiFraudService, FamilyService familyService) {
        this.aiFraudService = aiFraudService;
        this.familyService = familyService;
    }

    @PostMapping("/analyze")
    public FraudAnalyzeResponseDto analyzeText(
            @RequestBody FraudTextRequest request,
            Authentication authentication
    ) {
        String type = normalizeType(request.analysisType());
        String text = request.text() == null ? "" : request.text().trim();
        if (text.isBlank() || text.length() > 20_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "분석할 텍스트는 1~20000자로 입력해 주세요.");
        }

        String userId = authenticatedUserId(authentication);
        FraudAnalyzeResponseDto response = aiFraudService.analyzeText(type, text, userId);
        familyService.notifyFraudRisk(userId, response);
        return response;
    }

    @PostMapping("/voice/audio")
    public FraudAnalyzeResponseDto analyzeVoiceAudio(
            @RequestParam("media") MultipartFile media,
            Authentication authentication
    ) {
        if (media == null || media.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "분석할 음성 파일이 비어 있습니다.");
        }
        if (media.getSize() > MAX_AUDIO_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "음성 파일은 25MB 이하만 업로드할 수 있습니다.");
        }

        String userId = authenticatedUserId(authentication);
        try {
            FraudAnalyzeResponseDto response = aiFraudService.analyzeVoiceAudio(media, userId);
            familyService.notifyFraudRisk(userId, response);
            return response;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "음성 파일을 읽을 수 없습니다.", exception);
        }
    }

    private static String normalizeType(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!ANALYSIS_TYPES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 사기 분석 유형입니다.");
        }
        return normalized;
    }

    private static String authenticatedUserId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return authentication.getName();
    }

    public record FraudTextRequest(String analysisType, String text) {
    }
}
