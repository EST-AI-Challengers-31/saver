# 자동배포 최종 체크리스트 - GHCR 방식

## 서버 최초 1회

- [ ] `C:\home\dahum\app`의 origin이 `EST-AI-Challengers-31/saver`인지 확인
- [ ] `C:\home\dahum\runtime\.env` 생성
- [ ] Docker Desktop / Linux engine 실행 확인
- [ ] Windows 방화벽 및 공유기에서 SSH 22 확인
- [ ] Dahum host port 9000 사용 가능 확인
- [ ] `yellow.it.kr` A record가 서버 공인 IP를 가리키는지 확인
- [ ] 기존 MOVEAI Caddy에 `yellow.it.kr -> host.docker.internal:9000` route를 1회 추가

## GitHub 최초 1회

- [ ] `SERVER_HOST`
- [ ] `SERVER_USER`
- [ ] `SERVER_PASSWORD`
- [ ] `SERVER_PORT=22`
- [ ] 필요 시 `SERVER_APP_PATH=C:\home\dahum\app` Repository Variable
- [ ] Repository/Organization 정책에서 GitHub Actions의 package publish가 허용되는지 확인
- [ ] third-party Actions 사용이 허용되는지 확인 (`docker/*`, `appleboy/ssh-action`)

## main push 후 Actions에서 볼 것

- [ ] backend image build 성공
- [ ] FastAPI image build 성공
- [ ] GHCR push 성공
- [ ] SSH 접속 성공
- [ ] server git pull 성공
- [ ] MariaDB backup 단계 성공 또는 첫 배포라면 정상 skip
- [ ] `docker compose pull` 성공
- [ ] `docker compose up -d` 성공
- [ ] `/api/system/status` health check 성공

## 최종 확인

- [ ] `https://yellow.it.kr` 화면 표시
- [ ] Spring Boot UP
- [ ] MariaDB UP 및 table count > 0
- [ ] FastAPI UP
- [ ] `oo cleaner` 합성 데모 조회가 HIGH 반환

## 하지 말 것

- [ ] MariaDB 3306을 인터넷에 공개하지 않기
- [ ] FastAPI 8000을 인터넷에 공개하지 않기
- [ ] 실제 `.env`를 Git에 올리지 않기
- [ ] Dahum compose에서 80/443을 점유하지 않기
- [ ] MOVEAI Caddyfile을 자동배포마다 덮어쓰지 않기
- [ ] 운영 미니PC에서 application image를 임의로 `--build`해서 Actions/GHCR 배포본과 섞지 않기
- [ ] `docker compose down -v` 실행하지 않기
