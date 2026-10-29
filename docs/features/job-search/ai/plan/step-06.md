# 구직 관리 수정2 6단계: 예약 실행·[지금 평가]·상태 줄

- 요구사항: R40 (L44에서 변경), R105, R106, R73 (L44에서 변경), R75 (영향: R7 채점 대기, R23 다시 채점, R33 주간 수집)
- 목업: `recommend.html` recommend-status 구역, `sources.html` sources-bar 구역 (CSS: recommend.css·manage.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D21, D25, D26, D38, D43, D46, D68, D71, D72

## 할 일
- `processApi.ts`:
  - `loadProcessState`: 대기 수는 `batch_id` null인 것만 세고, `js_batches`에서 `submitted`인 행을 `BatchState[]`로 읽는다.
  - 새 `submitBatchOnce(session)`: `js-process {mode:"batch"}`.
- `processRun.ts` `runProcessNow`: 원문 받기 최대 5번(기존) → `submitBatchOnce` 한 번. 결과 글: "일괄 처리로 맡겼어요: 추출 N개 · 채점 M개", 한도로 남긴 공고가 있으면 "월 한도 때문에 K개는 다음에 맡겨요". queue 반복은 쓰지 않는다 (D46 변경). `processMessages.ts`에 문구.
- `useProcessRunner.ts`·`ProcessStatusLine.tsx`:
  - 진행 중 일괄이 있으면 상태 줄에 "일괄 처리 중: 채점 120개 맡김 · 10/30 06:12"(종류별 한 줄, 가장 이른 시각), [지금 평가]를 끈다 (R105, R106).
  - 예약 이어 하기 안내(다음 예약 시각)는 그대로 쓴다.
- `usage.ts` `summarizeUsage`: 오늘 호출 수에서 `batch = true`를 뺀다. 이번 달 사용액에는 넣는다 (R73, D25 변경).
- `recommendApi.ts` 채점 대기 수(R7): `waiting`이고 숨기지 않았고 `batch_id` null.
- 예약 실행(0008 `js_cron_continue`, 1단계)은 이미 batch를 부른다. 주간 수집 뒤 원문 받기가 끝나면 다음 이어 하기가 맡긴다 (R40).

## 확인할 결과
- `npm run build` 성공.
- 대기 공고가 있을 때 [지금 평가] → 결과 글 "일괄 처리로 맡겼어요 …", 상태 줄에 "일괄 처리 중: 추출 N개 맡김 · 시각", 버튼이 꺼짐. 수집 사이트 탭 상태 줄도 같음.
- 일괄이 끝나고 예약 이어 하기(최대 15분)가 지나면 상태 줄이 채점 일괄로 바뀌고, 다 끝나면 사라지며 버튼이 다시 켜짐.
- 사용액 줄: 일괄 저장 뒤 "오늘 N/100회"는 그대로, "이번 달 $"는 늘어난다.
- 이전 사용자 테스트 r2 13번(예약 실행과 알림): 주간 수집 예약을 2분 뒤로 바꾸고 기다리면 수집 → 원문 → 일괄 맡기기 → (일괄이 끝난 뒤) "새 추천 공고 N개" 알림. 일괄 처리 시간 때문에 알림은 1시간 이상 늦을 수 있다.
- 이전 사용자 테스트 r2 8번(이전 프로필 기준·다시 채점): 바로 호출 그대로 동작.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src/features/job-search/processApi.ts`·`processRun.ts`·`useProcessRunner.ts`·`processMessages.ts`·`usage.ts`·`recommendApi.ts`
- `apps/desktop/src/pages/job-search/process/ProcessStatusLine.tsx` (+ `.css`)
