# 구직 관리 14단계: 메일 확인·메일 제안 탭

- 요구사항: R64–R69
- 목업: mail.html (mail-bar, mail-list, mail-done)
- 경로 기준: `apps/desktop/src/` (서버는 저장소 `supabase/`)
- 공통 규칙: [index.md](index.md)의 결정 D15, D18, [../spec/ai-rules.md](../../ai/spec/ai-rules.md) "원문 취급"

## 할 일
- `js-gmail check` (R64–R67, R69):
  - 지난 확인 이후 메일을 Gmail API로 목록 조회 (제목·보낸 사람·받은 날 먼저).
  - 진행 중 지원 건(`closed = false`)의 회사 이름·도메인과 맞는 메일만 고르고, 나머지는 본문을 받지 않고 AI에도 보내지 않는다 (R65).
  - 고른 메일만 본문을 받아 Haiku로 분류 (작업 `mail`). 메일 안의 지시문은 따르지 않는다 (R66).
  - 분류 → 제안: 대상 지원 건, 현재 → 바꿀 상태, 세부 단계·결과, 근거 문장, 일정 (req-gmail.md 표). "기타"는 제안 없음.
  - 서버에는 제목·보낸 사람·받은 날·짧은 근거 발췌만 저장한다 (R69).
  - 토큰 거절이면 멈추고 `broken_at` (R70).
- `MailTab`: 위쪽 줄(마지막 확인 시각, [지금 확인]), `SuggestionCard` 목록, 아래 최근 30일 `DoneList`(승인·거절).
- `SuggestionCard`: 왼쪽 지원 건·메일 제목·보낸 사람·받은 날·근거 발췌(보라 왼쪽 선), 오른쪽 분류·현재 → 바꿀 상태 칩·일정·[거절] [승인].
- `applySuggestion.ts` (R68): 승인하면 `jobLink.serverId`로 로컬 카드를 찾아 상태·세부 단계·결과·전형 일정을 반영 → 12단계 `statusSync`로 서버 갱신. 카드가 없으면 "카드를 찾을 수 없어요"로 거절 처리.
- 탭 칩: 대기 중 제안 개수 (1단계 자리 채움).

## 확인할 결과
- 지원 건이 있는 회사 도메인에서 "서류 합격, 코딩테스트 11/5" 메일을 받은 뒤 [지금 확인] → 제안 카드 "지원 완료 → 전형 준비 · 코딩테스트 · 11/5".
- 관계없는 메일은 `js_ai_calls`의 `mail` 줄 수가 늘지 않는다 (AI에 보내지 않음).
- [승인] → Applications 카드 상태·세부 단계가 바뀌고 일정에 11/5 코딩테스트가 생긴다. 제안은 처리한 목록으로 옮겨진다.
- [거절] → 카드는 그대로, 처리한 목록에 "거절".
- `js_mail_suggestions`에 메일 본문 전체가 없다 (근거 발췌만).
- 메일 제안 탭 칩에 대기 개수가 보인다.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/js-gmail/index.ts`, `_shared/prompts.ts`, `src-tauri/src/server/migrations.rs`
- `features/job-search/applySuggestion.ts`, `api.ts`
- `pages/job-search/mail/MailTab.tsx`(+css), `SuggestionCard.tsx`, `DoneList.tsx`, 수정 `JobSearchTabs.tsx`
