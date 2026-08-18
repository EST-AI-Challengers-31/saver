package com.dahum.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class ClovaOcrService {

    @Value("${clova.ocr.url}")
    private String ocrUrl;

    @Value("${clova.ocr.secret}")
    private String ocrSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<String> extractText(MultipartFile file) {

        try {
            RestTemplate restTemplate = new RestTemplate();

            Map<String, Object> message = new HashMap<>();
            message.put("version", "V2");
            message.put("requestId", UUID.randomUUID().toString());
            message.put("timestamp", System.currentTimeMillis());
            message.put("lang", "ko");

            Map<String, String> imageInfo = new HashMap<>();
            imageInfo.put("format", getExtension(file));
            imageInfo.put("name", "upload");

            message.put(
                    "images",
                    Collections.singletonList(imageInfo)
            );

            String messageJson =
                    objectMapper.writeValueAsString(message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("X-OCR-SECRET", ocrSecret);

            ByteArrayResource imageResource =
                    new ByteArrayResource(file.getBytes()) {
                        @Override
                        public String getFilename() {
                            return file.getOriginalFilename();
                        }
                    };

            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            body.add("message", messageJson);
            body.add("file", imageResource);

            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            ocrUrl,
                            request,
                            String.class
                    );

            JsonNode root =
                    objectMapper.readTree(response.getBody());

            List<String> texts = new ArrayList<>();

            JsonNode images = root.get("images");

            if (images != null && images.isArray()) {
                for (JsonNode image : images) {

                    JsonNode fields = image.get("fields");

                    if (fields == null) {
                        continue;
                    }

                    for (JsonNode field : fields) {
                        JsonNode inferText =
                                field.get("inferText");

                        if (inferText != null) {
                            texts.add(inferText.asText());
                        }
                    }
                }
            }

            return texts;

        } catch (Exception e) {
            throw new RuntimeException(
                    "CLOVA OCR 처리 중 오류가 발생했습니다.",
                    e
            );
        }
    }

    private String getExtension(MultipartFile file) {

        String filename = file.getOriginalFilename();

        if (filename == null) {
            return "png";
        }

        int dotIndex = filename.lastIndexOf(".");

        if (dotIndex == -1) {
            return "png";
        }

        return filename
                .substring(dotIndex + 1)
                .toLowerCase();
    }
}