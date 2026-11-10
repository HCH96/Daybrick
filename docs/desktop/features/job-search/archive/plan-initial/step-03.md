# 구직 관리 3단계: AI 호출 모듈과 설정 탭 (한도·기준 잔액·단가)

- 요구사항: R71–R79
- 목업: settings.html (settings-limits, settings-balance, settings-prices), recommend.html (recommend-status 1줄)
- 경로 기준: `apps/desktop/src/` (서버는 저장소 `supabase/`)
- 공통 규칙: [index.md](index.md)의 결정 D15, 작은 규칙(모델 id, 캐시 단가 칸)

## 할 일
- `_shared/ai.ts`: `callClaude({ task, model, system, content, schema })`.
  - 호출 전: 오늘 호출 수·이번 달 비용을 `js_ai_calls`에서 세어, 한도를 넘으면 호출하지 않고 `{ kind: "limit" }`을 돌려준다 (R73–R74).
  - 호출 후: 모델·작업·토큰(입력·출력·캐시 읽기·쓰기)·비용(토큰 × `js_settings.prices`)을 기록한다 (R72, R79).
  - 크레딧 부족 오류는 `{ kind: "credit" }`으로 구분한다 (R78). 알림 연결은 15단계.
- `_shared/auth.ts`: 사용자 토큰으로 호출자 확인, 서비스 클라이언트 만들기.
- `JobSearchProvider`, `useJobSearch`: 설정·사용량을 읽고 새로고침.
- `usage.ts`: 오늘 호출 수, 이번 달 사용액, 기준 잔액(마지막 기록), 기준 이후 사용액, 예상 잔액 = 기준 − 이후 (R75–R76).
- 설정 탭
  - `LimitsPanel`: 하루 횟수·월 $.
  - `BalancePanel`: 기준 잔액 입력 + 입력 기록 표(날짜·금액).
  - `PricesPanel`: 모델별 입력·출력·캐시 읽기·캐시 쓰기 칸.
  - Gmail 판 자리는 13단계에서 채운다.
- `UsageLine`: 추천 공고 탭 위쪽 1줄. 막대 2개(80% 넘으면 주황), 예상 잔액 초록, 오른쪽 "이 앱의 호출만 계산한 값" (R77).

## 확인할 결과
- 한도를 50회·$5로, 기준 잔액을 $13으로 저장하고 앱을 다시 켜도 값이 남아 있다. 입력 기록 표에 날짜·금액 한 줄이 생긴다.
- 기준 잔액을 다시 넣으면 기준 이후 사용액이 $0부터 다시 센다.
- 추천 공고 탭 위에 "오늘 0/50회 · 이번 달 $0.00/$5 · 기준 $13 → 예상 $13.00"과 안내 글이 보인다.
- 단가 칸을 바꾸고 저장하면 다시 켜도 그대로다.
- `npm run build`, `cargo check` 성공. (`ai.ts`의 실제 호출은 4단계에서 확인)

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/ai.ts`, `_shared/auth.ts`, `src-tauri/src/server/migrations.rs`
- `features/job-search/JobSearchProvider.tsx`, `useJobSearch.ts`, `usage.ts`, `messages.ts`, `api.ts`
- `pages/job-search/settings/JobSettingsTab.tsx`(+css), `LimitsPanel.tsx`, `BalancePanel.tsx`, `PricesPanel.tsx`, `recommend/UsageLine.tsx`(+css)
- 수정: `pages/job-search/JobSearchPage.tsx`, `JobSearchTabs.tsx`
