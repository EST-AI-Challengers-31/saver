package com.dahum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * Spring Boot -> Python FastAPI 호출용 클라이언트입니다.
     * 별도 Builder 자동설정에 의존하지 않아 로컬/운영에서 동일하게 생성됩니다.
     */
    @Bean
    public RestClient restClient() {
        return RestClient.create();
    }

    /**
     * CLOVA OCR multipart 호출은 기존 서비스 구현과 호환되도록 유지합니다.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
