package com.dahum.controller;

import com.dahum.service.ClovaOcrService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    private final ClovaOcrService clovaOcrService;

    public OcrController(ClovaOcrService clovaOcrService) {
        this.clovaOcrService = clovaOcrService;
    }

    // ==========================================
    // API 1
    // 프론트에서 이미지 업로드
    // ==========================================

    @PostMapping
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {

        String ocrId = clovaOcrService.processOcr(file);

        return ResponseEntity.ok(
                Map.of(
                        "ocrId", ocrId,
                        "status", "COMPLETED"
                )
        );
    }


    // ==========================================
    // API 2
    // OCR 결과 조회
    // ==========================================

    @GetMapping("/{ocrId}")
    public ResponseEntity<?> getOcrResult(
            @PathVariable String ocrId
    ) {

        return ResponseEntity.ok(
                clovaOcrService.getOcrResult(ocrId)
        );
    }
}