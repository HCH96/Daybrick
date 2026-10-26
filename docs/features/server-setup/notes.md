# 서버 연결 (server-setup) 작업 노트
갱신: 2026-10-26

## 완료
- 1단계: 설정 화면 틀과 연결 정보 저장 (자동 진행, 최종 테스트 대기)
- 2단계: 첫 실행 안내와 마법사 틀 (자동 진행, 최종 테스트 대기)
- 3단계: ② 주소·키 확인 (자동 진행, 최종 테스트 대기)
- 4단계: ③ 자동 세팅 입력과 사전 확인 (자동 진행, 최종 테스트 대기)
- 5단계: 서버 구조 1번과 자동 세팅 실행 (자동 진행, 최종 테스트 대기)
- 6단계: Google 로그인과 ④ 완료 (자동 진행, 최종 테스트 대기)
- 7단계: 접속 확인·안내 띠·재개 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 8단계: 서버 업데이트·앱 업데이트 안내 (serverUpdate.ts·ServerUpdateScreen·AppUpdateNotice, 마법사 login-update·app-update 갈래 연결, 업데이트 전 서버 기능 막기)
- 관련 결정: D1–D18, D20–D25, D27, D28, D30–D33 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 지금 "서버 업데이트가 필요합니다" 띠는 설정으로 간다(`components/server/ServerBanner.tsx`의 `onOpen`). 8단계에서 서버 업데이트 화면으로 바꾼다. 업데이트가 끝나면 `useServer()`의 `recheck()`로 상태를 다시 확인한다.

## 확인할 문서 (경로는 docs/features/server-setup/ 기준, 파일 통째로 읽기)
- ai/plan/step-08.md
- ai/plan/index.md (결정·작은 규칙 칸)
- ai/spec/req-migrations.md
- ai/logs/L12.md
- human/mockups/server-update.html의 server-update·server-update-run·app-update 구역 (CSS: parts.css·common.css, 단계 목록은 wizard.css의 run-list, 설정 칸은 settings.css의 set-card에서 클래스 검색)
- ai/plan/structure.md의 화면 표 8단계 줄, 3. 컴포넌트 구조
