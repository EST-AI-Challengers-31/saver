package com.dahum.controller;

import com.dahum.service.ClovaOcrService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    private final ClovaOcrService clovaOcrService;

    public OcrController(
            ClovaOcrService clovaOcrService
    ) {
        this.clovaOcrService = clovaOcrService;
    }

    @PostMapping
    public ResponseEntity<?> extractText(
            @RequestParam("file") MultipartFile file
    ) {

        List<String> texts =
                clovaOcrService.extractText(file);

        Map<String, Object> response =
                new HashMap<>();

        response.put("success", true);
        response.put("texts", texts);

        return ResponseEntity.ok(response);
    }
}