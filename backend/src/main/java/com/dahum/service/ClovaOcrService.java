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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ClovaOcrService {

    @Value("${clova.ocr.url}")
    private String ocrUrl;

    @Value("${clova.ocr.secret}")
    private String ocrSecret;

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    // ==========================================
    // Android Package 정규식
    // 예:
    // com.kakao.talk
    // com.nhn.android.search
    // kr.co.example.app
    // org.example.application
    // ==========================================

    private static final Pattern PACKAGE_PATTERN =
            Pattern.compile(
                    "\\b(?:[a-zA-Z][a-zA-Z0-9_]*\\.){2,}[a-zA-Z][a-zA-Z0-9_]*\\b"
            );


    // ==========================================
    // OCR 결과 임시 저장
    // ocrId -> OCR 전체 텍스트
    // ==========================================

    private final Map<String, List<String>> ocrResults =
            new ConcurrentHashMap<>();


    // ==========================================
    // Package 결과 임시 저장
    // ocrId -> 추출된 Package 목록
    // ==========================================

    private final Map<String, List<String>> packageResults =
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


            // ==========================================
            // CLOVA OCR 요청 JSON
            // ==========================================

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


            message.put(
                    "images",
                    Collections.singletonList(imageInfo)
            );


            String messageJson =
                    objectMapper.writeValueAsString(message);


            // ==========================================
            // Header
            // ==========================================

            HttpHeaders headers =
                    new HttpHeaders();

            headers.setContentType(
                    MediaType.MULTIPART_FORM_DATA
            );

            headers.set(
                    "X-OCR-SECRET",
                    ocrSecret
            );


            // ==========================================
            // 이미지 파일
            // ==========================================

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


            // ==========================================
            // CLOVA OCR 호출
            // ==========================================

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            ocrUrl,
                            request,
                            String.class
                    );


            // ==========================================
            // OCR 결과 Parsing
            // ==========================================

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

                            String text =
                                    inferText.asText();

                            texts.add(text);
                        }
                    }
                }
            }


            // ==========================================
            // Package명 추출
            // ==========================================

            Set<String> packageSet =
                    new LinkedHashSet<>();


            // OCR이 단어 단위로 끊어서 반환하는 경우를 고려해
            // 전체 OCR 문자열을 한 번 합친 후 정규식 검색
            String combinedText =
                    String.join(" ", texts);


            Matcher matcher =
                    PACKAGE_PATTERN.matcher(combinedText);


            while (matcher.find()) {

                String packageName =
                        matcher.group();

                packageSet.add(packageName);
            }


            List<String> packages =
                    new ArrayList<>(packageSet);


            // ==========================================
            // OCR 결과 저장
            // ==========================================

            ocrResults.put(
                    ocrId,
                    texts
            );


            packageResults.put(
                    ocrId,
                    packages
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

        List<String> packages =
                packageResults.get(ocrId);


        if (texts == null) {

            return Map.of(
                    "ocrId", ocrId,
                    "status", "NOT_FOUND"
            );
        }


        return Map.of(
                "ocrId", ocrId,
                "status", "COMPLETED",
                "texts", texts,
                "packages",
                packages != null
                        ? packages
                        : Collections.emptyList()
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