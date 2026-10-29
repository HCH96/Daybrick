# r3 AI 테스트: 일괄 맡기기 (A6, A7, A8) — req-batch·req-usage

공통 수행 방법: 저장소의 `js-process/batch.ts`(`submitBatches`)·`batchResult.ts`(`pollBatches`)·`_shared/ai.ts`·`_shared/batch.ts`를 임시 폴더로 복사했다. 메모리 DB 흉내(Supabase 빌더의 eq·in·is·not·gte·order·range·upsert 등)와 fetch 흉내(Batch 만들기는 요청 수·크기를 기록, 바로 호출은 고정 응답)로 `node t_batch.ts`를 실행했다. 실제 DB·Anthropic이 아니다. 37건 모두 기대와 같았다.

## A6. batch 모드 순서·나누기·시간 한도
- 테스트 내용: 한 실행의 순서, 수집 뒤 일괄로 넘기는 경로, 40개·30MB 나누기, 100초 멈춤
- 근거 요구사항: R40, R41, R102, R103 (D71)
- 수행 방법: `js-process/index.ts` `runBatch`를 읽었다. `submitBatches`는 실행했다. `js-collect/index.ts` `run`, 앱 `SourcesTab.collect`·`processRun.ts`, 0008 `js_cron_continue`를 읽었다
- 예상 결과: 계획 D71대로
- 실제 결과:
  - 순서 (코드): `runBatch`는 `ensureFamilyBackfill` → `pollBatches(시작+100초)` → `submitBatches` → `loadInFlight` → 알림 순이다. 추출 결과로 extracted가 된 공고는 같은 실행의 `submitBatches`가 채점으로 맡긴다. A9에서 실행으로 확인했다: 결과 저장 뒤 맡기기에서 p1이 채점 일괄로 갔다
  - 맡기기 안의 순서 (실행): new 공고는 1차 필터를 AI 없이 바로 한다(f1 "캐릭터 원화가" → filtered1, 맡기지 않음). 추출 요청을 다 모은 뒤 추출 일괄들, 그다음 채점 일괄을 맡긴다
  - 40개 나누기 (실행): new 45개 + 채점 1개 → 일괄 행 `[extract 40, extract 5, score 1]`. createBatch 호출 순서도 40·5·1이고 `anthropic_id`가 각 행에 기록된다
  - 30MB 나누기 (실행): 원문 약 18MB(UTF-8) 공고 두 개 → 일괄 2개(1개씩)
  - 시간 (실행): `startedAt`을 100초 전으로 주면 `stopped {reason:"time"}`이고 Batch 호출 0번. `pollBatches`도 기한이 지나 있으면 `stopped time`
  - 수집 뒤 (코드): `js-collect run`과 앱 [지금 수집]은 js-process를 부르지 않는다. 다음 예약 `js_cron_continue`(15분마다)가 원문 받기를 먼저 끝낸 뒤 `js-process {mode:"batch"}`를 부른다. D71의 "예약은 원문 받기가 남아 있으면 맡기지 않고 기다린다"와 같다
- 판정: **통과**

## A7. 두 번 맡기지 않음·[그래도 채점]
- 테스트 내용: 이미 결과나 batch_id가 있는 공고는 맡기지 않는지, [그래도 채점]이 지금 프로필 점수가 있으면 AI를 부르지 않는지
- 근거 요구사항: R53, R109 (D73)
- 수행 방법: `submitBatches` 실행(위 시나리오). `js-process/index.ts` `runForce`, `steps.ts` `hasCurrentScore`를 읽었다
- 예상 결과: 두 번 맡기지 않음
- 실제 결과 (실행):
  | 공고 | 결과 |
  |---|---|
  | e1 waiting, 추출 있음(dev), 점수 없음 | 추출을 맡기지 않고 의심·중복·2차 필터를 거쳐 extracted → 채점 일괄에만 들어감 |
  | e2 extracted, 지금 프로필(v2) 점수 있음 | AI 없이 `scored`, batch_id 없음 |
  | e3 new, 추출 있음(art) | 추출을 맡기지 않고 filtered2 |
  | b1 batch_id 있음, h1 숨김 | 대상에서 빠짐 |
  | 맡긴 공고 n01 | batch_id = 일괄 행 id, stage new 그대로 |
  | 같은 DB로 다시 실행 | submitted `{extract:0, score:0}`, Batch 호출 0 |
  - [그래도 채점] (코드): `runForce`는 `hasCurrentScore`가 참이면 `setStage(scored)`(filtered_by null)만 하고 `{ok:true, stage:"scored"}`를 돌려준다. 추출·채점 AI 호출이 없다
- 판정: **통과**

## A8. 예상 비용·월 한도·할인·하루 한도
- 테스트 내용: 예상 비용 계산, 월 한도 안만 맡기기, 진행 중 예상분 합산, 0.5배 비용 기록, 하루 횟수 한도를 일괄에 쓰지 않는지
- 근거 요구사항: R73, R74, R110 (D72)
- 수행 방법: `submitBatches`·`pollBatches`·`callClaude` 실행. `estimateCost`·`monthlyRoom`·`recordBatchCall`·`readUsage`를 읽었다
- 예상 결과: 한도를 넘는 만큼 held→waiting, 비용 절반
- 실제 결과 (실행):
  - 기본값: 최근 30일 일괄 기록이 없으면 extract 0.002·score 0.03. 일괄 행 `est_cost_usd`는 40개 0.08, 5개 0.01, 채점 1개 0.03
  - 한도 계산: 월 한도 1.5, 이번 달 사용 0.5(바로 호출 0.25 + 일괄 0.125×2), 진행 중 일괄 예상 0.25 → 남은 양 0.75. 30일 안 일괄 extract 평균은 0.125이다(31일 전 9달러 행은 평균에서 빠짐). new 8개 중 6개를 맡기고 2개는 held → `waiting`, `stopped {limit, monthly}`. 맡긴 일괄 est 0.75
  - 할인: 결과를 저장할 때 `js_ai_calls`에 `batch true`로 기록한다. haiku 입력 100만 토큰(단가 $1)은 0.5, opus(단가 $5)는 2.5 → 0.5배. errored 항목 기록은 비용 0
  - 하루 한도: daily_limit 2이고 오늘 일괄 기록이 5개여도 바로 호출(`callClaude`)은 ok다(`readUsage`가 `batch=false`만 셈). 바로 호출 기록이 2개가 되면 `limit daily`. 이 상태에서도 `submitBatches`는 맡긴다(`monthlyRoom`은 하루 수를 보지 않음)
  - 알림 (코드): `monthlyRoom`이 남은 양 0이면 월 초과 알림, `recordBatchCall`이 기록 뒤 80%·100% 월 알림을 보낸다(하루 80% 알림은 없음)
- 판정: **통과**
