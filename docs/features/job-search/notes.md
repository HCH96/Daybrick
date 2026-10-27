# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-27

## 완료
- 1단계: 페이지 틀과 탭 (자동 진행, 최종 테스트 대기)
- 2단계: 서버 구조 3번과 자동 생성 비밀값 (자동 진행, 최종 테스트 대기)
- 3단계: AI 호출 모듈과 설정 탭 (한도·기준 잔액·단가) (자동 진행, 최종 테스트 대기)
- 4단계: 프로필 (자동 진행, 최종 테스트 대기)
- 5단계: 규칙 실행기와 수집 함수 (기본 어댑터) (자동 진행, 최종 테스트 대기)
- 6단계: 수집 사이트 탭 (자동 진행, 최종 테스트 대기)
- 7단계: 사이트 추가·시험 수집·어댑터 가이드 (자동 진행, 최종 테스트 대기)
- 8단계: 필터 탭 (자동 진행, 최종 테스트 대기)
- 9단계: 처리 함수 (필터·추출·채점) (자동 진행, 최종 테스트 대기)
- 10단계: 추천 공고 탭 (자동 진행, 최종 테스트 대기)
- 11단계: 상세 팝업·걸러진 공고·보관함 (자동 진행, 최종 테스트 대기)
- 12단계: 지원하기·일정 제안 (지원 관리 수정) (자동 진행, 최종 테스트 대기)

## 다음 진행
- 13단계: Gmail 연결·해제 (127.0.0.1 수신기로 Google 인증 → `js-gmail connect`가 갱신 토큰 암호화 저장, 연결 해제, 설정 탭 `GmailPanel`)
- 관련 결정: D3, D13, D14, D15, D18, D22, D24, D26, D27 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: step 파일의 "시작 전에 확인"(OAuth 클라이언트 종류·갱신 토큰·취소 영향)은 실제로 확인한 것과 추측을 나눠 기록에 적는다. 설정 탭은 `settings/JobSettingsTab.tsx`에 패널을 더한다. 안내 문구는 `messages.ts`(길어서 끝에 구역 주석을 달고 덧붙임).

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-13.md
- ai/spec/req-gmail.md (R60–R63, R70)
- ai/logs/L16.md
- human/mockups/settings.html의 settings-gmail 구역 (CSS: manage.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 js-gmail·oauth_listener.rs·gmailConnect.ts·GmailPanel 줄과 `js_gmail_tokens` 줄
- docs/features/server-setup의 D13(127.0.0.1 콜백) 줄만 grep (server-setup ai/spec/decisions.md)
