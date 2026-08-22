package com.dahum.service;

import com.dahum.dto.FraudAnalyzeResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AiFraudService {

    private final RestClient restClient;
    private final String aiBaseUrl;

    public AiFraudService(
            RestClient restClient,
            @Value("${dahum.ai.base-url}") String aiBaseUrl
    ) {
        this.restClient = restClient;
        this.aiBaseUrl = aiBaseUrl;
    }

    public FraudAnalyzeResponseDto analyzeText(String analysisType, String text, String requesterUserId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("analysis_type", analysisType);
        body.put("text", text);
        if (requesterUserId != null) {
            body.put("requester_user_id", requesterUserId);
        }
        return restClient
                .post()
                .uri(aiBaseUrl + "/api/v1/fraud/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(FraudAnalyzeResponseDto.class);
    }

    public FraudAnalyzeResponseDto analyzeVoiceAudio(MultipartFile media, String requesterUserId) throws IOException {
        String filename = media.getOriginalFilename() == null ? "voice-audio" : media.getOriginalFilename();
        ByteArrayResource resource = new ByteArrayResource(media.getBytes()) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        MultiValueMap<String, Object> multipart = new LinkedMultiValueMap<>();
        multipart.add("media", resource);
        if (requesterUserId != null) {
            multipart.add("requester_user_id", requesterUserId);
        }

        return restClient
                .post()
                .uri(aiBaseUrl + "/api/v1/fraud/voice/audio")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(multipart)
                .retrieve()
                .body(FraudAnalyzeResponseDto.class);
    }
}
