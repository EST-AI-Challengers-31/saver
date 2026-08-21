package com.dahum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * CLOVA OCR multipart 호출은 기존 서비스 구현과 호환되도록 유지합니다.
     *
     * RestClient는 HttpClientConfig에서 timeout 설정과 함께 단일 Bean으로 생성합니다.
     * 같은 이름의 RestClient Bean을 두 곳에서 만들면 Spring Boot 기동 시
     * BeanDefinitionOverrideException이 발생할 수 있으므로 여기서는 생성하지 않습니다.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
