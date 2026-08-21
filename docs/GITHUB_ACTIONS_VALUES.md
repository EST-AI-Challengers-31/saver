# GitHub Actions 값

운영 서버 `.env`는 사용하지 않습니다. GitHub Actions Secrets/Variables가 Base64 RuntimeConfig로 PowerShell 프로세스에 전달됩니다.

## 필수 Secrets

- `SPRINGDATASOURCEPASSWORD`: MariaDB 앱 사용자 + Spring/Python 공통 비밀번호
- `MARIADBROOTPASSWORD`: MariaDB root 비밀번호
- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_PORT`
- `SERVER_SSH_KEY`
- `SERVER_PASSWORD`

## 기능별 선택 Secrets

- `KAKAOCLIENTID`, `KAKAOCLIENTSECRET`: Kakao 로그인 활성화 시
- `CLOVAOCRSECRET`: 이미지 OCR 사용 시
- `LLMAPIKEY`: 외부 LLM 사용 시
- `PINECONEAPIKEY`, `UPSTAGEAPIKEY`: `VECTOR_PROVIDER=pinecone` 사용 시

## 권장 Variables

```text
MARIADB_DATABASE=dahum
MARIADB_USER=dahum_app
SPRING_DATASOURCE_URL=jdbc:mariadb://mariadb:3306/dahum
SPRING_DATASOURCE_USERNAME=dahum_app
AI_BASE_URL=http://ai:8000
DAHUM_RUNTIME=C:/home/dahum/runtime
DAHUM_HOST_PORT=9000
PUBLIC_DOMAIN=yellow.it.kr
PUBLIC_BASE_URL=https://yellow.it.kr
VECTORPROVIDER=local
RAGSIMILARITYTHRESHOLD=0.80
RAGTOPK=5
PINECONEINDEX=dahum-malware
```

이미지 OCR을 사용하려면 `CLOVAOCRURL` Variable에 실제 CLOVA OCR invocation URL을 등록합니다.
