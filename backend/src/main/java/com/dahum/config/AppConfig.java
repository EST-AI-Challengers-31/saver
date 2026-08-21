package com.dahum.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * Spring Boot -> Python FastAPI 호출에 사용하는 표준 HTTP 클라이언트입니다.
     */
    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        return builder.build();
    }

    /**
     * CLOVA OCR의 multipart 요청은 기존 구현과의 호환을 위해 RestTemplate을 유지합니다.
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }
}
