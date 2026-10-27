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
- 13단계: Gmail 연결·해제 (인증 방식 B는 사용자 결정, 최종 테스트 대기)

## 다음 진행
- 14단계: 메일 확인·메일 제안 탭 (`js-gmail check`로 지원 건과 맞는 메일만 Haiku 분류 → 제안 저장, `MailTab`·`SuggestionCard`·`DoneList`, 승인 시 로컬 카드 반영)
- 관련 결정: D1–D18, D20–D41 (ai/spec/decisions.md에서 이 줄만 읽기. 특히 D2, D5, D14, D15, D18, D25, D26, D40, D41)
- 주의: 접근 토큰은 `js-gmail/token.ts`의 `storedAccessToken(caller)`로 받는다(거절이면 `broken_at` 기록됨). `check`는 `js-gmail/index.ts`의 action 분기에 더하고, AI를 쓰므로 `migrations.rs`의 js-gmail `files`에 `AI`·`PROMPTS`를 더한다. 앱 서버 호출은 `api.ts` 대신 새 파일(예: `mailApi.ts`)에 둬도 된다(api.ts가 750줄 넘음). 문구는 `messages.ts` 끝에 구역 주석을 달고 덧붙인다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-14.md
- ai/spec/req-gmail.md (R64–R69)
- ai/spec/ai-rules.md의 "원문 취급" 구역만 grep
- ai/logs/L17.md
- human/mockups/mail.html의 mail-bar·mail-list·mail-done 구역 (CSS: manage.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 js-gmail·mail/·`js_mail_suggestions`·`js_applications` 줄
