# 구직 관리 수정2 5단계: 일괄 결과 받기·채점 맡기기

- 요구사항: R103, R104, R108, R74 (L44에서 변경), R41 (L44에서 변경) (영향: R53 재사용, R80 새 추천 알림, R83–R89 중복 확인)
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D37, D43, D47, D49, D53, D54, D57, D61, D70, D71, D72, D73

## 할 일
- 새 `js-process/batchResult.ts`:
  - `pollBatches(ctx, deadline)`: `status = 'submitted'`인 행마다 `getBatch`. `ended`면 `readResults`로 결과를 읽어 `batch_id = 이 일괄`인 공고만 저장한다 (이미 저장한 공고는 batch_id가 비어 건너뜀). 다 읽으면 `status = 'saved'`, `ended_at`, `counts`. 시간이 되면 멈추고 다음 실행이 이어 읽는다.
  - 결과 하나 저장 (`succeeded`): `recordBatchCall`(usage로 비용), 추출이면 `saveExtraction` → 인젝션 의심이면 `suspect` → `checkDuplicate`(수정1, 묶이면 끝) → 2차 필터 → 통과면 `extracted`(채점 대상). 채점이면 `saveScore` → `scored`. 저장 뒤 `batch_id = null`.
  - `errored`: 내용 거절(invalid_request·policy, D47의 rejected와 같은 판정)이면 `failed`. 그 밖 errored·`expired`·`canceled`는 `batch_id`만 비워 대기로 되돌린다 (R108).
  - 크레딧 부족 오류가 보이면 기존 `noticeCredit`.
- `js-process/index.ts` `batch` 모드 순서: `pollBatches` → `submitBatches`(4단계, 방금 `extracted`가 된 공고가 채점 일괄로 감 = R103의 두 번째 맡기기). 응답에 `saved: { extract, score }`.
- 새 추천 알림 (R80, D43): 채점 일괄을 저장한 실행에서 진행 중 일괄도 맡길 공고도 남지 않았으면 `noticeRecommend`.
- 공고 하나 버튼(force·rescore)과 프로필·메일은 바뀌지 않는다 (R107).

## 확인할 결과
- `cargo check` 성공, [서버 업데이트] 성공.
- 4단계에서 맡긴 추출 일괄이 끝난 뒤(콘솔에서 Ended 확인) `batch`를 한 번 부르면: `js_batches` 그 행 `saved`, 공고가 `extracted`·`filtered2`·`duplicate`·`suspect` 중 하나로 바뀌고 `batch_id` 비어 있음, 새 `kind score` 행이 생김.
- 채점 일괄이 끝난 뒤 다시 부르면 추천 공고 탭에 점수와 함께 나온다.
- `select task, batch, cost_usd from js_ai_calls order by at desc limit 5` → `batch = true`, 비용이 같은 토큰의 바로 호출의 절반.
- 같은 결과를 두 번 읽어도(행을 SQL로 `submitted`로 되돌리고 다시 호출) 기록·점수가 두 번 생기지 않는다.
- 묶음 대표와 같은 공고가 추출 결과로 들어오면 채점 일괄에 들어가지 않는다 (R85).

## 이 단계에서 만들거나 고칠 파일
- 새 `supabase/functions/js-process/batchResult.ts`
- `supabase/functions/js-process/index.ts`·`steps.ts`·`dedupe.ts`(필요하면 export만)
- `apps/desktop/src-tauri/src/server/migrations.rs`
