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
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ClovaOcrService {

    @Value("${clova.ocr.url}")
    private String ocrUrl;

    @Value("${clova.ocr.secret}")
    private String ocrSecret;

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    // OCR 결과 임시 저장
    private final Map<String, List<String>> ocrResults =
            new ConcurrentHashMap<>();


    // ==========================================
    // OCR 실행
    // ==========================================

    public String processOcr(MultipartFile file) {

        try {

            RestTemplate restTemplate =
                    new RestTemplate();


            // OCR ID 생성
            String ocrId =
                    UUID.randomUUID().toString();


            // CLOVA OCR 요청 JSON
            Map<String, Object> message =
                    new HashMap<>();

            message.put(
                    "version",
                    "V2"
            );

            message.put(
                    "requestId",
                    UUID.randomUUID().toString()
            );

            message.put(
                    "timestamp",
                    System.currentTimeMillis()
            );

            message.put(
                    "lang",
                    "ko"
            );


            Map<String, String> imageInfo =
                    new HashMap<>();

            imageInfo.put(
                    "format",
                    getExtension(file)
            );

            imageInfo.put(
                    "name",
                    "upload"
            );

            // api 이미지
            message.put(
                    "images",
                    Collections.singletonList(imageInfo)
            );


            String messageJson =
                    objectMapper.writeValueAsString(message);


            // Header
            HttpHeaders headers =
                    new HttpHeaders();

            headers.setContentType(
                    MediaType.MULTIPART_FORM_DATA
            );

            headers.set(
                    "X-OCR-SECRET",
                    ocrSecret
            );


            // 이미지 파일
            ByteArrayResource imageResource =
                    new ByteArrayResource(
                            file.getBytes()
                    ) {

                        @Override
                        public String getFilename() {
                            return file.getOriginalFilename();
                        }
                    };


            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            body.add(
                    "message",
                    messageJson
            );

            body.add(
                    "file",
                    imageResource
            );


            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(
                            body,
                            headers
                    );


            // CLOVA OCR 호출
            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            ocrUrl,
                            request,
                            String.class
                    );


            // 결과 Parsing
            JsonNode root =
                    objectMapper.readTree(
                            response.getBody()
                    );


            List<String> texts =
                    new ArrayList<>();


            JsonNode images =
                    root.get("images");


            if (images != null && images.isArray()) {

                for (JsonNode image : images) {

                    JsonNode fields =
                            image.get("fields");

                    if (fields == null) {
                        continue;
                    }


                    for (JsonNode field : fields) {

                        JsonNode inferText =
                                field.get("inferText");


                        if (inferText != null) {

                            texts.add(
                                    inferText.asText()
                            );
                        }
                    }
                }
            }


            // OCR 결과 저장
            ocrResults.put(
                    ocrId,
                    texts
            );


            return ocrId;


        } catch (Exception e) {

            throw new RuntimeException(
                    "CLOVA OCR 처리 실패",
                    e
            );
        }
    }


    // ==========================================
    // OCR 결과 조회
    // ==========================================

    public Map<String, Object> getOcrResult(
            String ocrId
    ) {

        List<String> texts =
                ocrResults.get(ocrId);


        if (texts == null) {

            return Map.of(
                    "ocrId", ocrId,
                    "status", "NOT_FOUND"
            );
        }


        return Map.of(
                "ocrId", ocrId,
                "status", "COMPLETED",
                "texts", texts
        );
    }


    // ==========================================
    // 파일 확장자 확인
    // ==========================================

    private String getExtension(
            MultipartFile file
    ) {

        String filename =
                file.getOriginalFilename();


        if (filename == null) {
            return "png";
        }


        int dotIndex =
                filename.lastIndexOf(".");


        if (dotIndex == -1) {
            return "png";
        }


        return filename
                .substring(dotIndex + 1)
                .toLowerCase();
    }
}