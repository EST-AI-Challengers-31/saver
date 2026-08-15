# 14. 실제 배포 전에 추가로 확인할 정보

현재 구조를 만드는 데 필요한 핵심 정보는 대부분 확보되었다. 아래 값만 실제 코드가 생기는 시점에 확인하면 된다.

## 아직 확인 필요한 값

| 항목 | 왜 필요한가 | 현재 처리 |
|---|---|---|
| Dahum GitHub repository URL | mini PC 최초 clone / origin 검증 | 미정 |
| 기본 배포 branch | Action trigger / git pull | 현재 `main` 가정 |
| React package manager | Docker build command | 현재 npm + `npm ci` 가정 |
| React build output | Spring static copy 경로 | 현재 Vite `dist/` 가정 |
| Java version | Spring build/runtime image | 현재 Java 21 가정 |
| Python version | FastAPI image | 현재 Python 3.11 가정 |
| Spring health endpoint | 자동 배포 성공 판정 | 구현 필요 |
| FastAPI `/health` | 내부 AI 상태 확인 | 구현 필요 |
| Gabia A record 실제 상태 | `yellow.it.kr` routing | 서버 외부에서 확인 필요 |
| Kakao OAuth app key/redirect URI | 로그인 | runtime secret / console 설정 필요 |
| Google OAuth client/redirect URI | 로그인 | runtime secret / console 설정 필요 |

## 지금 당장 받을 필요 없는 정보

- MariaDB 3306 외부 포트: 열지 않는다.
- FastAPI 8000 외부 포트: 열지 않는다.
- React 별도 host port: 만들지 않는다.
- 새로운 public 80/443: 기존 MOVEAI Caddy가 담당한다.

## 배포 직전 확인 명령

```powershell
Resolve-DnsName yellow.it.kr -Type A
Test-NetConnection 121.166.129.218 -Port 22
Test-NetConnection 127.0.0.1 -Port 9000
Get-Content C:\MOVEAI\.env | Select-String "API_DOMAIN"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```
