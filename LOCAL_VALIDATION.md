# Local artifact validation

이 압축본 생성 시 다음 항목을 확인했다.

- GitHub Actions workflow YAML 파싱 성공
- workflow에 `contents: read`, `packages: write` 선언
- backend / FastAPI image를 GHCR에 SHA tag로 push하도록 구성
- automatic deploy가 `latest` 대신 exact `${{ github.sha }}` image를 사용
- FastAPI `main.py` Python 문법 검사 성공
- frontend `package.json` JSON 파일 존재 확인
- Compose에 `mariadb / ai / backend / caddy` 서비스 존재
- Compose의 backend/ai가 `build:`가 아니라 GHCR `image:`를 사용
- MariaDB / FastAPI host port 미노출
- Dahum compose가 host 80/443을 점유하지 않고 `${DAHUM_HOST_PORT}:80`만 사용
- `deploy.ps1`에 GHCR login, pull/up, DB backup, health gate, image rollback 존재
- 기존 MOVEAI Caddy 자동수정 기본 OFF
- 실제 비밀번호/API Key 하드코딩 없음

## 이 환경에서 직접 실행하지 못한 검사

- npm registry 접근이 타임아웃되어 실제 React dependency build는 완료하지 못함
- Docker daemon이 없어 실제 Docker image build/push는 실행하지 못함
- Windows PowerShell이 없어 `deploy.ps1` 실제 실행은 재현하지 못함
- 실제 GitHub Organization GHCR package 권한은 첫 Actions 실행에서 확인 필요

따라서 최종 실행 검증은 첫 GitHub Actions run이 담당한다. 빌드가 실패하면 서버 배포 단계로 넘어가지 않고, 배포 후 health가 실패하면 workflow도 실패한다.
