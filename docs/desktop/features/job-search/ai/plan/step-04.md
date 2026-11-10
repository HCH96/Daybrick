# 구직 관리 수정2 4단계: 일괄 맡기기

- 요구사항: R102, R106, R109, R110, R73 (L44에서 변경)
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D23, D25, D26, D37, D45, D47, D64, D70, D71, D72, D73

## 할 일
- `_shared/ai.ts`:
  - `callClaude`의 요청 본문 만들기를 `messageParams(input)`로 빼서 바로 호출과 일괄이 같은 본문을 쓴다 (structured outputs, D45).
  - `BATCH_DISCOUNT = 0.5`, `recordBatchCall(caller, { task, model, usage, ok })`: `js_ai_calls`에 `batch = true`, 비용 = 단가 × 0.5로 기록. 월 80%·초과 알림은 기존 함수 재사용 (R74).
  - `monthlyRoom(caller)`: 월 한도 − 이번 달 사용액 (하루 수는 보지 않음, D64).
- 새 `_shared/batch.ts`: `POST /v1/messages/batches`(요청 `{ custom_id: 공고 id, params }`), `GET …/batches/{id}`(`processing_status`·`request_counts`·`results_url`), `readResults(url, onLine, deadline)`(본문을 줄 단위로 읽어 JSON 하나씩 넘기고 시간이 되면 멈춤). 결과 종류 `succeeded|errored|canceled|expired`. `migrations.rs`에 상수 `BATCH`.
- `js-process/steps.ts`: `extract`·`score`를 "요청 만들기(`extractRequest`·`scoreRequest`)"와 "결과 저장(`saveExtraction`·`saveScore`)"으로 나눈다. 바로 호출 경로(force·rescore·queue)는 두 함수를 이어 쓰므로 동작이 같다.
- 새 `js-process/batch.ts` `submitBatches(ctx, startedAt)`:
  1. 맡길 공고: `batch_id` null, 숨기지 않음, 원문 있음, stage `new`(+ 프로필이 있으면 `waiting`·`extracted`).
  2. `new`는 1차 필터를 AI 없이 바로 한다 (걸리면 `filtered1`).
  3. 재사용 (D73, R109): 추출이 이미 있으면 추출을 맡기지 않고 결과 처리(5단계 함수)로 넘긴다. 지금 프로필 버전 점수가 있으면 `scored`로 바로.
  4. 예상 비용 (D72): 작업별 최근 30일 `batch = true` 호출의 평균 비용, 없으면 기본값(추출 $0.002, 채점 $0.03). `monthlyRoom − 진행 중 일괄의 est_cost 합`을 넘지 않는 만큼만 고르고, 나머지는 그대로 대기 (`waiting`, R110).
  5. 추출·채점을 각각 40개·약 30MB(첨부 포함 본문 크기)씩 나눠 `createBatch` → `js_batches` 행 → 공고 `batch_id`. 시간(시작 100초)이 지나면 남은 것은 다음 실행.
- `js-process/index.ts`: `{ mode: "batch" }` → `{ ok: true, submitted: { extract, score }, held, inFlight: BatchState[], stopped }`. 이 단계에서는 결과 확인 없이 맡기기만 (5단계에서 앞에 결과 확인을 붙임). `queue`는 지우지 않는다 (D71).

## 확인할 결과
- `cargo check`·`npm run build` 성공, [서버 업데이트] 성공.
- SQL로 `js-process {mode:"batch"}`를 한 번 부르거나(`select public.js_cron_call('js-process','{"mode":"batch"}')`) 대기 공고가 있을 때 예약을 기다린다 → `js_batches`에 `kind extract, status submitted` 행이 생기고, 그 공고들의 `batch_id`가 채워진다. Anthropic 콘솔 Batches 화면에도 보인다.
- 월 한도를 지금 사용액 + $0.01로 낮춘 뒤 다시 부르면 일부(또는 0개)만 맡기고 응답 `held` > 0, 맡기지 못한 공고는 `waiting`.
- 같은 공고가 두 번 맡겨지지 않는다 (`batch_id` 있는 공고는 대상에서 빠짐).

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/ai.ts`, 새 `_shared/batch.ts`
- `supabase/functions/js-process/steps.ts`·`index.ts`, 새 `js-process/batch.ts`
- `apps/desktop/src-tauri/src/server/migrations.rs`
