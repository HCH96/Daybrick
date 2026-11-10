# r3 AI 테스트: 흐름 줄·new 표시 (A16, A17) — req-recommend·req-analysis

## A16. 흐름 줄 집계
- 테스트 내용: 이번 주 공고를 모든 단계로 읽는지, 묶음을 따로 세는지, 옛 `SourceNames`가 남았는지
- 근거 요구사항: R94, R95, R91
- 수행 방법:
  - `api.ts` `loadFlowPostings`와 `FiltersTab.tsx` `loadAll`을 읽었다
  - `filterRules.ts` `summarizeFlow`를 Node로 실행했다
  - `grep -rn "SourceNames" apps/desktop/src`를 실행했다
- 예상 결과: 한 단계가 실패해도 전체가 실패하지 않음
- 실제 결과:
  - 읽기: 단계 조건 없이 `collected_at >= 이번 주 월요일(한국 시간)`인 공고를 1000행씩 모두 읽는다. 모르는 단계 행은 건너뛰어 그 행 하나로 전체가 실패하지 않는다. 흐름 읽기가 실패해도 `Promise.all` 안에서 따로 처리하므로 필터 목록은 그대로 보인다(상태 줄에 오류만 나옴)
  - 집계 (실행): new·filtered1·extracted·filtered2·scored·waiting(추출 있음)·waiting(없음)·duplicate 2·failed·suspect, 모두 11개 → `collected 11, unprocessed 1, firstPassed 5, extractedOk 4, secondPassed 2, scored 1, waiting 2, bundled 2`. 묶음은 `bundled`로 따로 센다. `FlowLine`은 `bundled > 0`일 때 "중복으로 묶음 N개"를 보여 준다
  - `SourceNames`: grep 결과 없음(종료 코드 1)
- 판정: **통과**

## A17. new 표시
- 테스트 내용: new 표시 조건
- 근거 요구사항: R8
- 수행 방법: `PostingGrid.tsx`, `RecommendTab.tsx`, `useOpenedAt.ts`, `localState.ts` `markRecommendOpened`를 읽었다
- 예상 결과: 마지막으로 탭을 연 뒤 들어온 공고
- 실제 결과:
  - 조건은 `posting.collectedAt > openedAt`이다. `openedAt`은 추천 공고 탭을 마지막으로 떠난 시각이고, 로컬 파일 `recommendOpenedAt`에 저장된다
  - 탭에 있는 동안은 처음 읽은 값을 그대로 써서 표시가 유지된다. 탭을 떠날 때 지금 시각을 저장한다. 한 번도 연 적이 없으면 null이라 표시하지 않는다
- 판정: **통과**
- 참고: 기준이 수집 시각이다. 일괄 처리로 채점이 몇 시간 늦어지는 동안 탭을 열었다 닫으면, 그 공고는 추천에 처음 나올 때 new가 붙지 않는다. 사용자 테스트에서 이 동작이 원하는 것인지 확인이 필요하다.
