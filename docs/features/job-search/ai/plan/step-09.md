# 구직 관리 수정2 9단계: 애매한 쌍 AI 판정

- 요구사항: R113, R114, R115 (영향: R84 엄격 판정)
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D26, D45, D53, D55, D59, D61, D67, D70, D77

## 할 일
- `_shared/dedupe.ts`: 순수 함수 `pairKind(a, b): "same" | "ambiguous" | "different"`.
  - `same`: 지금 `isSameJob`과 같음 (D55).
  - `ambiguous` (R113, 회사 일치(`companyMatch`)가 먼저): 제목 Dice 0.5 이상 0.8 미만이고 마감일이 같음, 또는 제목·직무는 같은데(정리 제목 같음 또는 정리 직무 같음) 마감일이 한쪽만 있거나 다름.
  - 그 밖 `different`. `isSameJob`은 `pairKind === "same"`으로 바꾸어 같은 결과를 낸다.
- `_shared/prompts.ts`: `PAIR_SYSTEM`·`PAIR_SCHEMA`(`{ result: same|different|unknown }`), `pairContent(a, b)`(두 공고의 회사·제목과 추출 항목 직무·자격 요건·마감·근무지).
- `js-process/dedupe.ts` `checkDuplicate`:
  - 후보마다 `pairKind`. `same`이 있으면 지금처럼 묶는다. 없고 `ambiguous`가 있으면 `js_pair_checks`(`a < b`)를 먼저 본다. 없으면 `callClaude`(Haiku, task `dedupe`, 바로 호출 — D67)로 묻고 결과를 저장 (R115).
  - `same`이면 R85–R86대로 묶는다. `different`·`unknown`이면 묶지 않는다 (R114).
  - 하루·월 한도나 오류로 묻지 못하면 묶지 않고 저장도 하지 않는다 (D77). 공고는 다음 단계로 계속 간다.
  - 한 공고에서 묻는 쌍은 최대 3개.
- `_shared/ai.ts` `AiTask`에 `dedupe`, `_shared/prompts.ts`를 쓰는 함수 묶음은 이미 js-process에 있음.
- 소급 적용(`backfillDedupe`)은 바꾸지 않는다 (애매한 쌍은 새로 처리하는 공고에서만).

## 확인할 결과
- `cargo check` 성공, [서버 업데이트] 성공.
- Node로 `pairKind` 표:
  - "서버 개발자" / "서버 개발자(MMORPG)", 마감 같음 → ambiguous (Dice 0.5–0.8)
  - "서버 개발자" / "서버 개발자", 마감 11/15 / 없음 → ambiguous
  - "서버 개발자" / "서버 개발자", 마감 같음 → same
  - "서버 개발자" / "클라이언트 개발자", 마감 같음 → different
  - 회사 "넥슨"/"넥슨게임즈"는 회사 판정(D55)대로
- SQL 시험 행으로 애매한 쌍을 만든 뒤 처리 → `js_pair_checks`에 한 행, `js_ai_calls`에 `task dedupe` 한 행. 같은 쌍을 다시 처리(`js_refilter`)해도 `task dedupe` 행이 늘지 않는다.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/dedupe.ts`·`prompts.ts`·`ai.ts`
- `supabase/functions/js-process/dedupe.ts`
