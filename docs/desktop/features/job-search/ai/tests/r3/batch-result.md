# r3 AI 테스트: 일괄 결과·예약·앱 (A9, A10, A11, A12, A20) — req-batch·req-alerts·req-usage

## A9. 결과 저장
- 테스트 내용: 성공·실패·만료·거절 처리, 두 번 읽기, 그 사이 묶인 공고, anthropic_id 빈 행 정리
- 근거 요구사항: R103, R108 (L49·L50)
- 수행 방법: `js-process/batchResult.ts` `pollBatches`를 메모리 DB 흉내 + fetch 흉내(상태 ended·results_url, 결과 JSONL)로 실행했다(`t_batch.ts` 4번 시나리오). 실제 Batch API 응답이 아니다
- 예상 결과: 각각 기대대로
- 실제 결과 (실행):
  | 공고·일괄 | 결과 줄 | 결과 |
  |---|---|---|
  | p1 new (추출 일괄 B1) | succeeded, family dev | 추출 저장 → extracted, batch_id 비움 |
  | p8 new | succeeded, family art | filtered2 `matched ["art"]` |
  | p2 new | errored overloaded_error | 대기: stage new 그대로, batch_id 비움 |
  | p3 waiting | expired | 대기: waiting 그대로, batch_id 비움 |
  | p4 new | errored invalid_request_error | failed, `filtered_by [{kind:"process-failed"}]` |
  | p5 new | succeeded, stop_reason refusal | failed |
  | p6 extracted (채점 일괄 B2) | succeeded | scored, 점수 50, profile_version 2(맡긴 시각 기준) |
  | p7 duplicate (맡긴 뒤 묶임) | succeeded | 점수만 저장하고 duplicate 유지 (`toScored` false) |
  | B1·B2 | — | saved로 닫힘. 응답 `saved {extract:2, score:2}` |
  | B3: anthropic_id 없음, 11분 전 | — | failed로 닫힘, q1 batch_id 비움 |
  | B4: anthropic_id 없음, 1분 전 | — | 그대로 submitted (q2 batch_id 유지) |
  - 두 번 읽기: B1·B2를 submitted로 되돌려 처음부터 다시 읽게 했다 → `saved {0,0}`, `js_ai_calls` 행 수·`js_scores` 그대로. 저장한 공고는 batch_id가 비어 `saveLine`이 건너뛴다
  - 이어서 `submitBatches`: 대기로 돌아간 p2·p3·q1은 추출 일괄로 다시 맡겨지고, extracted p1은 채점 일괄로 맡겨진다
- 판정: **통과**

## A10. 예약 이어 하기 (js_cron_continue)
- 테스트 내용: 진행 중 일괄도 대기 공고도 없으면 서버 함수를 부르지 않는지
- 근거 요구사항: R104 (D71, D43)
- 수행 방법: 0008의 `js_cron_continue` 읽기 (SQL 실행은 하지 않음)
- 예상 결과: SQL 조건이 맞음
- 실제 결과:
  - ① 최근 7일 원문 없는 공고가 있으면(켜진 사이트, 숨김·duplicate 제외) `js-collect bodies`만 부르고 끝낸다
  - ② 아니면 아래 셋 중 하나가 있을 때만 `js-process {"mode":"batch"}`를 부른다: submitted 일괄, 맡길 공고(batch_id 없음·숨김 아님·원문 있음, new 또는 프로필이 있을 때 waiting·extracted), `family_version < 1`
  - ③ 둘 다 없으면 아무것도 부르지 않는다
  - 맡길 공고 조건은 `submitBatches`의 `pickPostings`(new, 프로필이 있으면 waiting·extracted, batch_id null, hidden null, body 있음)와 같다
- 판정: **통과**
- 참고: 직군 채우기가 끝나기 전(`family_version < 1`)에는 할 일이 없어도 15분마다 batch를 부른다. 끝나면 멈춘다.

## A11. [지금 평가]·바로 호출·결과 문구
- 테스트 내용: 앱 [지금 평가]가 batch를 부르는지, 진행 중이면 꺼지는지, 단건·프로필·메일은 바로 호출하는지, 결과 문구
- 근거 요구사항: R106, R107 (L51)
- 수행 방법: `processRun.ts` `runProcessNow`, `processApi.ts` `submitBatchOnce`·`loadProcessState`, `ProcessStatusLine.tsx`를 읽었다. 앱 전체에서 `mode: "queue"`·`"force"`·`"rescore"`·`js-profile`·`js-gmail` 호출을 grep했다. `batchRunMessage`는 Node로 실행했다
- 예상 결과: 문구·조건이 일치
- 실제 결과:
  - [지금 평가]: 원문 받기(최대 5번) → `js-process {mode:"batch"}` 한 번. 앱에 `mode: "queue"` 호출이 없다
  - 진행 중: `hasWork`가 `inFlight` 있음을 포함해 버튼을 그리고, `disabled={batchBusy}`, `title="맡긴 일괄 처리가 끝나면 다시 누를 수 있어요"` → 숨기지 않고 끈다. `runProcessNow`도 inFlight가 있으면 부르지 않는다
  - 바로 호출: [그래도 채점] `postingApi.forceScore` → `mode:"force"`, [다시 채점] → `mode:"rescore"`, 프로필 `js-profile`, 메일 `js-gmail check`. 서버에서 `createBatch`를 쓰는 곳은 js-process의 batch·batchResult·familyBackfill뿐이다
  - 문구 (실행): 결과만 저장 → "끝난 일괄 결과를 5개 저장했어요. 새로 맡길 공고는 없어요." / 맡김 → "일괄 처리로 맡겼어요: 추출 3개 · 채점 5개." / 월 한도 → "… 월 한도 때문에 2개는 다음에 맡겨요." / 없음 → "맡길 공고가 없어요."
- 판정: **통과**

## A12. 상태 줄 문구
- 테스트 내용: 진행 중 일괄 줄의 형식과 두 탭 표시
- 근거 요구사항: R105
- 수행 방법: `processMessages.ts` `batchLines`를 Node로 실행(TZ=Asia/Seoul). `ProcessStatusLine.tsx` `BatchRows`와 `RecommendTab.tsx`·`SourcesTab.tsx`의 `<ProcessStatusLine>`을 grep했다
- 예상 결과: "일괄 처리 중: 채점 120개 맡김 · 10/30 06:12" 형식
- 실제 결과: 채점 100개(21:12Z)와 20개(21:30Z) → `"채점 120개 맡김 · 10/30 06:12"`. 종류별 한 줄로, 수는 더하고 시각은 가장 이른 것을 쓴다. 화면은 `<b>일괄 처리 중</b>: {text}` → "일괄 처리 중: 채점 120개 맡김 · 10/30 06:12". 추천 공고 탭(122행)과 수집 사이트 탭(192행) 둘 다 같은 컴포넌트를 쓴다
- 판정: **통과**

## A20. 회귀: 새 추천 알림·채점 대기·사용액 줄
- 테스트 내용: 새 추천 알림 조건, "채점 대기 N개" 계산, 사용액 줄의 오늘 호출 수
- 근거 요구사항: R7, R75, R80 (L50)
- 수행 방법: `js-process/index.ts` `runBatch`·`noticeRecommend`, `recommendApi.ts` 대기 수 쿼리를 읽었다. `usage.ts` `summarizeUsage`는 Node로 실행했다
- 예상 결과: 기대대로
- 실제 결과:
  - 알림: `savedAny`(추출이든 채점이든 결과를 하나라도 저장함) && 진행 중 일괄 0 && 멈춤 없음 && held 0일 때 `noticeRecommend`를 부른다. N은 지난 알림 뒤 수집된 scored·숨김 아님·지원 안 함 공고 수(기존 계산 그대로)
  - 채점 대기: `stage = waiting`·숨김 아님·`batch_id is null`만 센다(맡긴 공고는 빠짐)
  - 사용액 줄 (실행): 오늘 바로 호출 1·일괄 2, 어제 1 → `todayCalls 1`, 이번 달 사용액 1.0(일괄 포함). 앱 `parseAiCall`이 `batch` 칸을 읽는다
- 판정: **통과**
