package com.dahum.controller;

import com.dahum.dto.AnalyzeResponseDto;
import com.dahum.service.AiAnalyzeService;
import com.dahum.service.ClovaOcrService;
import com.dahum.util.PackageNameExtractor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analyze")
public class AnalyzeController {

    private final ClovaOcrService clovaOcrService;
    private final AiAnalyzeService aiAnalyzeService;

    public AnalyzeController(ClovaOcrService clovaOcrService, AiAnalyzeService aiAnalyzeService) {
        this.clovaOcrService = clovaOcrService;
        this.aiAnalyzeService = aiAnalyzeService;
    }

    @PostMapping
    public AnalyzeResponseDto analyze(@RequestParam("image") MultipartFile image) {
        // 1) OCR 실행
        String ocrId = clovaOcrService.processOcr(image);
        Map<String, Object> ocrResult = clovaOcrService.getOcrResult(ocrId);

        // status가 NOT_FOUND일 경우 처리
        if (!"COMPLETED".equals(ocrResult.get("status"))) {
            throw new IllegalStateException("OCR 처리 결과를 찾을 수 없습니다: " + ocrId);
        }

        @SuppressWarnings("unchecked")
        List<String> extractedTexts = (List<String>) ocrResult.get("texts");

        // 2) 패키지명만 필터링
        List<String> packageNames = PackageNameExtractor.extractUniquePackages(extractedTexts);

        // 3) OCR 결과 나오자마자 바로 AI 서버 POST /api/analyze 호출
        return aiAnalyzeService.analyze(packageNames);
    }
}