# GitHub Actions 값

운영 서버 `.env`는 사용하지 않습니다. GitHub Actions Secrets/Variables가 Base64 RuntimeConfig로 PowerShell 프로세스에 전달됩니다.

## 현재 저장소에 맞춘 Secrets 이름

아래 이름은 GitHub Repository Settings > Secrets and variables > Actions > Secrets에 그대로 등록합니다.

### 배포/DB 필수

- `SPRINGDATASOURCEPASSWORD`: MariaDB 앱 사용자 + Spring/Python 공통 비밀번호
- `MARIADBROOTPASSWORD`: MariaDB root 비밀번호
- `SERVER_HOST`: Windows 미니PC 주소
- `SERVER_USER`: SSH 사용자
- `SERVER_PORT`: SSH 포트
- `SERVER_SSH_KEY`: SSH private key
- `SERVER_PASSWORD`: SSH key만으로 인증할 경우 비어 있어도 되지만 workflow는 fallback 값으로 지원

### 기능별 Secrets

- `KAKAOCLIENTID`: Spring Kakao OAuth Client ID
- `KAKAOCLIENTSECRET`: Spring Kakao OAuth Client Secret
- `VITE_KAKAO_CLIENT_ID`: Vite 프론트 빌드용 Kakao Client ID. 브라우저 번들에 포함될 수 있으므로 Client Secret을 넣으면 안 됨
- `CLOVA_OCR_SECRET`: 이미지 OCR secret
- `LLMAPIKEY`: 현재 Python LLM 경로의 API key
- `PINECONE_API_KEY`: Pinecone 사용 시
- `UPSTAGE_API_KEY`: Upstage embedding 사용 시
- `ALAN_CLIENT_ID`: 기존 Alan 연동 호환용. 현재 Python-first 위험도 판정의 필수값은 아님

현재 workflow는 과거 이름인 `CLOVAOCRSECRET`, `PINECONEAPIKEY`, `UPSTAGEAPIKEY`도 fallback으로 계속 인식합니다. 새로 등록할 때는 위 표의 실제 등록 이름을 우선 사용합니다.

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

이미지 OCR을 사용하려면 `CLOVAOCRURL` Variable에 실제 CLOVA OCR invocation URL을 등록합니다. 외부 LLM endpoint를 사용할 경우 `LLMAPIBASEURL` Variable을 추가합니다.

## 전달 규칙

- `SPRINGDATASOURCEPASSWORD` -> `MARIADB_PASSWORD` + `SPRING_DATASOURCE_PASSWORD`
- `MARIADBROOTPASSWORD` -> `MARIADB_ROOT_PASSWORD`
- `KAKAOCLIENTID` -> `KAKAO_CLIENT_ID`
- `KAKAOCLIENTSECRET` -> `KAKAO_CLIENT_SECRET`
- `CLOVA_OCR_SECRET` -> `CLOVA_OCR_SECRET`
- `LLMAPIKEY` -> `LLM_API_KEY`
- `PINECONE_API_KEY` -> `PINECONE_API_KEY`
- `UPSTAGE_API_KEY` -> `UPSTAGE_API_KEY`
- `ALAN_CLIENT_ID` -> `ALAN_CLIENT_ID`
- `VITE_KAKAO_CLIENT_ID` -> Backend Docker의 frontend-build 단계에 build arg로 전달

Secret 값 자체는 코드, 문서, Actions 로그에 기록하지 않습니다.
