package com.dahum.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dahum.dto.DemoCheckRequest;
import com.dahum.dto.DemoCheckResponse;
import com.dahum.service.DemoCheckService;
import com.dahum.service.SystemStatusService;

@RestController
@RequestMapping("/api")
public class SystemController {
    private final SystemStatusService systemStatusService;
    private final DemoCheckService demoCheckService;

    public SystemController(SystemStatusService systemStatusService, DemoCheckService demoCheckService) {
        this.systemStatusService = systemStatusService;
        this.demoCheckService = demoCheckService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "dahum-backend");
    }

    @GetMapping("/system/status")
    public Map<String, Object> systemStatus() {
        return systemStatusService.status();
    }

    @PostMapping("/demo/check")
    public ResponseEntity<DemoCheckResponse> demoCheck(@RequestBody DemoCheckRequest request) {
        return ResponseEntity.ok(demoCheckService.check(request.appName()));
    }
}
