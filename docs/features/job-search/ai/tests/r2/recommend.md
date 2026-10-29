# r2 AI 테스트: 목록 제외·묶음 바꾸기·화면 (A8–A10)

## A8. 목록·대기 수·필터 다시 적용에서 묶인 공고 제외
- 근거 요구사항: R7, R9, R46, R47, R91
- 수행 방법: 0003 `js_refilter`, 앱 `recommendApi.ts`(추천 목록·수 세기), `postingApi.ts`(걸러진·보관함 목록), `processApi.ts`(대기 수), `js-process/index.ts` `pickQueue`·`countQueue` 읽기
- 예상 결과: duplicate 빠짐
- 실제 결과:
  - `js_refilter`: stage `new/filtered1/extracted/filtered2`만 `new`로 되돌림 → duplicate·dup_of는 그대로(묶음 유지). 되돌린 대표가 다시 처리되면 `checkDuplicate`는 자기 묶인 공고를 후보에서 빼고(dup_of null·stage≠duplicate 조건), 다른 묶음에 지면 자기 묶인 공고까지 함께 옮김
  - 대기 수·대기열: 앱 `QUEUE_STAGES`·서버 `QUEUE_STAGES`가 `new/waiting/extracted`, 채점 대기 수는 `stage = waiting` → duplicate 없음
  - 추천 목록 `stage = scored`, 걸러진 목록·수 `in(filtered1, filtered2, suspect, failed)` → stage로 빠짐
  - 보관함 목록·수: `hidden_at not null`에 `.neq("stage","duplicate")`가 더해짐 (D54)
- 판정: **통과**

## A9. js_switch_rep·js_unbundle SQL
- 근거 요구사항: R87, R93, D54, L35
- 수행 방법: 0007의 두 함수 읽기, 0003 `js_extractions`·`js_scores`의 `posting_id` 기본 키 확인. `js_switch_rep`은 A6에서 같은 동작을 JS로 옮겨 실행
- 예상 결과: 규칙대로 구현됨
- 실제 결과:
  - `js_switch_rep`: 새 대표에 stage·filtered_by·hidden_at 복사·dup_of null, 추출·점수 `on conflict (posting_id)` upsert(기본 키라 성립), 옛 대표와 그 묶인 공고를 `duplicate`·`dup_of 새 대표`·hidden_at null. 서비스 역할만 실행
  - `js_unbundle`(본인 확인, security definer): 묶인 공고 → dup_of null·unbundled true·stage new·filtered_by null, 반환 null. 대표 → 남은 공고 중 `own_site desc, collected_at, id`로 새 대표(R86) → `js_switch_rep` → 옛 대표를 unbundled true·stage new, 반환 새 대표 id. 묶인 공고가 없는 대표는 null
  - 지원한 묶음 막기: SQL 안에는 지원 검사가 없고, 화면(`PopupSources` `locked`)에서 [따로 보기]를 끈다. 계획 step-07·D63이 막는 위치를 화면으로 정했으므로 계획대로다
- 판정: **통과**
- 참고: ① 지원 막기가 화면에만 있어 rpc를 직접 부르면 지원한 묶음도 풀린다. ② 풀린 묶인 공고는 원문이 없는 채로 stage new가 된다. 수집된 지 7일이 지났으면 15분 예약(`js_cron_continue`)이 원문을 받지 않아, 다음 주간 수집이나 [지금 수집] 때까지 처리되지 않는다.

## A10. 화면 코드
- 근거 요구사항: R55, R91–R93, L40·L41 테스트 메모
- 수행 방법: `SourceNames.tsx`, `PostingCard.tsx`·`ArchivedList.tsx`·`FilteredList.tsx`의 사용 위치, `bundleApi.ts`, `recommendApi.ts`·`postingApi.ts`의 출처 읽기, `PopupSources.tsx`, `PostingPopup.tsx`의 `unbundle`·`apply`·렌더, `SourceView.tsx` 읽기
- 예상 결과: 조건대로 구현됨
- 실제 결과:
  - 출처 줄: `SourceNames`는 `sources.length < 2`면 그리지 않음. 카드·걸러진·보관함 행 세 곳에서 사용. 묶음이 없는 대표는 `loadBundleSources` 맵에 없어 `[]`
  - 지운 사이트: 임베드 `js_sites(name)`이 없거나 빈 이름이면 "지운 사이트"
  - 출처 읽기 실패: 추천·걸러진·보관함 목록과 팝업 모두 목록·팝업 읽기 실패로 돌려줌 (L40·L41 메모와 같음)
  - 팝업 출처 블록: 출처 2개 이상일 때만, 줄마다 사이트 이름 ↗(`openExternal`), url이 없으면 `disabled`, 대표 줄 "(대표)"
  - [따로 보기]: `locked = appliedAt !== null`이면 꺼짐(툴팁 안내), 다른 작업 중에도 꺼짐. 대표를 풀면 `onChanged` 뒤 닫고, 묶인 공고를 풀면 안내 문구 후 다시 읽음
  - [지원하기]: 팝업 공고(대표)의 `posting.url`·id로 지원 건을 만듦. 원문 없는 묶음 대표는 `REP_BODY_PENDING` 문구
- 판정: **통과**
