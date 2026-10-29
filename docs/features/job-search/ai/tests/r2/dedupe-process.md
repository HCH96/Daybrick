# r2 AI 테스트: 처리 단계 중복 확인·소급 적용 (A6–A7)

두 항목 모두 실제 함수를 실행했다. 임시 폴더에 메모리 DB 흉내(`mockdb.ts`: PostgREST 체인 select/update/upsert/eq/neq/is/in/ilike/order/range/limit/maybeSingle, `js_extractions!inner` 임베드, 0007 `js_switch_rep` SQL을 그대로 옮긴 rpc)를 만들고, 저장소의 `supabase/functions/js-process/dedupe.ts`를 그대로 불러와 `node a67.ts`로 돌렸다. 25건 모두 통과. 실제 Supabase에서는 돌리지 않았다.

## A6. 처리 단계 중복 확인 (js-process)
- 근거 요구사항: R41, R83–R85, R88, D57, L39 테스트 메모
- 수행 방법: `js-process/index.ts`의 `processOne`·`runQueue`·`runForce` 위치 확인(grep·읽기) + `checkDuplicate` 실행
- 예상 결과: 규칙대로 구현됨
- 실제 결과:
  | 확인 | 결과 |
  |---|---|
  | 위치 | `processOne`에서 추출·의심 판정 뒤, `secondFilter` 전. 묶이면 `done`으로 끝나 채점 안 함 |
  | force·rescore | `checkDuplicate`는 `processOne`에서만 불림. `runForce`·`runRescore`는 부르지 않음 |
  | A6-1 자사 P가 게임잡 대표 O(scored)를 이김 | `{bundled:true, stage:"scored"}`, O와 O에 묶인 O2가 P 아래로, P에 점수 복사 |
  | A6-2 게임잡 P, 자사 대표 O | P `duplicate`·`dup_of O` |
  | A6-3 대표 O 지원함, P 자사 | P가 묶임 (지원한 공고는 묶인 쪽이 안 됨) |
  | A6-4 둘 다 지원 | 묶지 않음 |
  | A6-5 P만 지원(게임잡), O 자사 | P가 대표, O가 묶임 |
  | A6-6/7 후보 마감 지남 / 후보 unbundled | 제외 |
  | A6-8 후보가 숨김+걸러짐(filtered2) | 후보로 잡힘 (P가 이겨 `stage:"filtered2"` 이어 받음) |
  | A6-9/10 후보 추출 없음 / 같은 사이트 | 제외 |
  | A6-11 P 자신이 unbundled | 판정 안 함 |
  | A6-12 마감 상시 vs 날짜 | 다름 |
- 판정: **통과**
- 참고: ① A6-5처럼 지원한 P가 대표가 되면 `js_switch_rep`이 옛 대표의 stage·filtered_by·hidden_at을 지원한 P에 복사한다(옛 대표가 숨김이었으면 지원한 공고에도 숨김이 붙음). 드문 경우라 실패로 보지 않았다. ② 후보 좁히기는 원래 회사 이름에 대한 `ilike '%앞두글자%'`라, 정리 전 이름 앞 두 글자 사이에 공백·기호가 있으면(예: "N C소프트") 후보에서 빠질 수 있다(D61대로 구현).

## A7. 소급 적용
- 근거 요구사항: R89, D56, L39 테스트 메모
- 수행 방법: `index.ts`의 `ensureBackfill`·`runQueue` 읽기 + `backfillDedupe` 실행 (step-05 "옮기기 전후 예시" 데이터를 그대로 넣음)
- 예상 결과: 후 A duplicate·dup_of B, B 대표(scored 80)
- 실제 결과:
  | 확인 | 결과 |
  |---|---|
  | 한 번만 | `runQueue` 시작 때 `dedupe_version < 1`일 때만 실행, 끝나면 `js_settings` upsert로 1 (행이 없어도 1이 됨, A7-11) |
  | A7-2/3 step-05 예시 | A `duplicate`·`dup_of B`, B `scored`·dup_of null·점수 80 그대로 — 기대와 같음 |
  | A7-4 마감 다른 쌍(11/15·11/20) | 안 묶임 |
  | A7-5 넥슨/넥슨게임즈, 제목 다름 | 안 묶임 |
  | A7-6 마감 지난 쌍 | 묶임 (D61: 소급은 마감 지난 공고 포함), 숨긴 채점 공고가 대표로 숨김 유지 |
  | A7-7 norm_key | 새 규칙 값으로 다시 저장 (`스마일게이트|서버개발자`) |
  | A7-10 묶인 쪽만 숨김 | 대표에 hidden_at 옮김, 묶인 쪽 null (R88) |
  | A7-12 대표 순서 | 지원함(게임잡·채점 없음) > 채점 있음·자사 |
  | A7-9 시간 한도 넘김 | `false` 반환, version 0 유지. `ensureBackfill`이 false면 `console.warn("js-process: 소급 묶기를 끝내지 못함 (다음 실행에서 다시)")` (코드 확인), 한도는 queue 시작 + 60초 |
  | 백업 | 0007 적용 때 `js_postings_backup_0007`에 이전 stage·norm_key가 남음 (A2) |
- 판정: **통과**
- 참고: 넥슨/넥슨게임즈라도 제목·마감이 같으면 `companyMatch`(앞부분 일치, D55)로 처리 단계·소급에서 묶인다. 수집 단계 norm_key는 회사가 정확히 같아야 해서 묶지 않는다. 규칙대로다.
