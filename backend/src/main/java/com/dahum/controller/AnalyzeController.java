package com.dahum.controller;

import com.dahum.dto.AnalyzeResponseDto;
import com.dahum.service.AiAnalyzeService;
import com.dahum.service.ClovaOcrService;
import com.dahum.service.FamilyService;
import com.dahum.util.PackageNameExtractor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/analyze")
public class AnalyzeController {

    private static final Set<String> OCR_STOP_WORDS = Set.of(
            "설정", "앱", "애플리케이션", "설치", "삭제", "열기", "확인", "취소", "검색"
    );

    private final ClovaOcrService clovaOcrService;
    private final AiAnalyzeService aiAnalyzeService;
    private final FamilyService familyService;

    public AnalyzeController(
            ClovaOcrService clovaOcrService,
            AiAnalyzeService aiAnalyzeService,
            FamilyService familyService
    ) {
        this.clovaOcrService = clovaOcrService;
        this.aiAnalyzeService = aiAnalyzeService;
        this.familyService = familyService;
    }

    @PostMapping
    public AnalyzeResponseDto analyze(
            @RequestParam("image") MultipartFile image,
            Authentication authentication
    ) {
        if (image == null || image.isEmpty()) {
            throw new BadAnalyzeRequestException("분석할 이미지가 비어 있습니다.");
        }

        String ocrId = clovaOcrService.processOcr(image);
        Map<String, Object> ocrResult = clovaOcrService.getOcrResult(ocrId);

        if (!"COMPLETED".equals(ocrResult.get("status"))) {
            throw new BadAnalyzeRequestException("OCR 처리 결과를 찾을 수 없습니다: " + ocrId);
        }

        @SuppressWarnings("unchecked")
        List<String> extractedTexts = (List<String>) ocrResult.getOrDefault("texts", List.of());
        @SuppressWarnings("unchecked")
        List<String> ocrPackages = (List<String>) ocrResult.getOrDefault("packages", List.of());

        List<String> queries = normalizeQueries(ocrPackages);
        if (queries.isEmpty()) {
            queries = PackageNameExtractor.extractUniquePackages(extractedTexts);
        }
        if (queries.isEmpty()) {
            queries = fallbackOcrQueries(extractedTexts);
        }
        if (queries.isEmpty()) {
            throw new BadAnalyzeRequestException("OCR 결과에서 분석 가능한 앱 정보를 찾지 못했습니다.");
        }

        String sourceLabel = image.getOriginalFilename() == null
                ? "uploaded-image"
                : image.getOriginalFilename();
        AnalyzeResponseDto response = aiAnalyzeService.analyze(queries, "IMAGE_OCR", sourceLabel);
        familyService.notifyAppRisk(authenticatedUserId(authentication), response);
        return response;
    }

    @PostMapping("/text")
    public AnalyzeResponseDto analyzeText(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String query = body.getOrDefault("query", "").trim();
        if (query.isBlank()) {
            throw new BadAnalyzeRequestException("앱 이름 또는 패키지명을 입력해 주세요.");
        }
        if (query.length() > 300) {
            throw new BadAnalyzeRequestException("입력값은 300자 이하로 입력해 주세요.");
        }
        AnalyzeResponseDto response = aiAnalyzeService.analyze(List.of(query), "TEXT", query);
        familyService.notifyAppRisk(authenticatedUserId(authentication), response);
        return response;
    }

    private static String authenticatedUserId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return authentication.getName();
    }

    private static List<String> normalizeQueries(List<String> values) {
        LinkedHashSet<String> queries = new LinkedHashSet<>();
        for (String raw : values) {
            if (raw == null) {
                continue;
            }
            String value = raw.trim();
            if (!value.isBlank()) {
                queries.add(value);
            }
            if (queries.size() >= 100) {
                break;
            }
        }
        return List.copyOf(queries);
    }

    private static List<String> fallbackOcrQueries(List<String> texts) {
        LinkedHashSet<String> queries = new LinkedHashSet<>();
        for (String raw : texts) {
            if (raw == null) {
                continue;
            }
            String value = raw.replaceAll("\\s+", " ").trim();
            if (value.length() < 2 || value.length() > 80) {
                continue;
            }
            if (value.chars().allMatch(Character::isDigit)) {
                continue;
            }
            if (OCR_STOP_WORDS.contains(value)) {
                continue;
            }
            queries.add(value);
            if (queries.size() >= 20) {
                break;
            }
        }
        return List.copyOf(queries);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private static class BadAnalyzeRequestException extends RuntimeException {
        BadAnalyzeRequestException(String message) {
            super(message);
        }
    }
}
