# 서버 연결 (server-setup) 작업 노트
갱신: 2026-10-26

## 완료
- 1단계: 설정 화면 틀과 연결 정보 저장 (자동 진행, 최종 테스트 대기)
- 2단계: 첫 실행 안내와 마법사 틀 (자동 진행, 최종 테스트 대기)
- 3단계: ② 주소·키 확인 (자동 진행, 최종 테스트 대기)
- 4단계: ③ 자동 세팅 입력과 사전 확인 (자동 진행, 최종 테스트 대기)
- 5단계: 서버 구조 1번과 자동 세팅 실행 (자동 진행, 최종 테스트 대기)
- 6단계: Google 로그인과 ④ 완료 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 접속 확인·안내 띠·재개 (health.ts·useHealthCheck 상태 판정과 주기 확인, AppLayout 띠 자리, ServerBanner·ResumeDialog·ServerRequired, Rust restore_project·project_status)
- 관련 결정: D1–D18, D20–D23, D25, D29, D30 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 로그인 뒤 확인은 `serverFunctions.ts`의 `fetchHealth(session.client)`를 쓴다(`{ schema, keyRegisteredAt, email }`). 세션은 `useServer()`의 `session`이고, 켤 때 복원이 끝나기 전에는 `sessionReady`가 false다(그동안 `login-needed`로 판정하지 않는다). 복원은 인터넷이 끊겼으면 토큰을 남기고 null을 돌려준다. 지금 `status`는 연결 정보 유무로만 정한다(`ServerProvider`).

## 확인할 문서 (경로는 docs/features/server-setup/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/plan/index.md (결정·작은 규칙 칸)
- ai/spec/req-health.md
- ai/logs/L11.md
- human/mockups/banners.html의 banners-kinds·banners-need 구역, part-resume.html의 resume·resume-wait 구역 (CSS: parts.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 프론트 로직 표(health.ts 줄), 화면 표 7단계 줄, 3. 컴포넌트 구조
