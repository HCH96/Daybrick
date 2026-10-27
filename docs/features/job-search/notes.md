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
- 14단계: 메일 확인·메일 제안 탭 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 15단계: 예약 실행과 알림 (`0004_job_search_cron.sql` 예약 작업 3개, `auth.ts` 예약 비밀값 경로, `notify.ts`로 알림 6종, 알림의 `tab` 열기)
- 관련 결정: D1–D18, D19, D20–D42 (ai/spec/decisions.md에서 이 줄만 읽기. 특히 D14, D15, D19, D24, D25, D26, D37, D41, D42)
- 주의: 메일 확인은 `js-gmail/index.ts`의 `check` 분기가 `checkMail(caller)`를 부른다(예약 경로도 같은 함수에 caller만 바꿔 넘기면 됨). "메일 제안 N개" 알림은 `checkMail` 결과의 `suggested`, "Gmail 연결 끊김"은 `markBroken`(`js-gmail/token.ts`)이 부르는 자리에서 보낸다. 탭 열기는 이미 `JobSearchPage`의 `usePageIntent("job-search", …)`가 `intent.tab`을 처리한다(step 파일의 JobSearchTabs가 아님) — 확인만 하면 된다. `notify.ts`는 아직 `migrations.rs`에서 `allow(dead_code)`다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-15.md
- ai/spec/req-collect.md (R33, R36), ai/spec/req-usage.md (R74, R78), ai/spec/req-alerts.md (R80–R81)
- ai/logs/L18.md
- ../notifications/ai/spec/extension.md (알림 보내는 법)
- ai/plan/structure.md의 `0004`·`auth.ts`·`notify.ts` 줄 (새 파일 위치를 정할 때만)
