# frontend

React + TypeScript + Vite 모바일 우선 UI입니다.

## 현재 구현
- `/api/system/status`로 Spring/MariaDB/FastAPI 상태 표시
- `/api/demo/check`로 MariaDB의 합성 데모 악성앱 데이터 정확일치 확인
- 배포 확인용 홈 화면

## Production
프론트는 별도 포트로 서비스하지 않습니다. `backend/Dockerfile`의 첫 번째 stage에서 `npm run build` 후 `dist/`를 Spring Boot `static`에 넣습니다.

## 이후 추가
카카오/Google 로그인, 가족 연결, 이미지 업로드, 실제 분석 결과 UI를 기존 컴포넌트 위에 추가합니다.
