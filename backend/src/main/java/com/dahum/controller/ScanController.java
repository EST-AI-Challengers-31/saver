package com.dahum.controller;

import com.dahum.service.AiAnalyzeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scans")
public class ScanController {

    private final AiAnalyzeService aiAnalyzeService;

    public ScanController(AiAnalyzeService aiAnalyzeService) {
        this.aiAnalyzeService = aiAnalyzeService;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(defaultValue = "20") int limit) {
        return aiAnalyzeService.getScanHistory(limit);
    }

    @GetMapping("/{scanId}")
    public ResponseEntity<Map<String, Object>> detail(@PathVariable String scanId) {
        Map<String, Object> detail = aiAnalyzeService.getScanDetail(scanId);
        return detail == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(detail);
    }
}
