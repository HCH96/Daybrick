# r2 AI 테스트: 정리·판정 함수와 수집 단계 묶기 (A3–A5)

## A3. 정리·판정 순수 함수 실행
- 테스트 내용: step-03 "확인할 결과" 표 전체, D59 뒤 괄호 규칙, cleanTitle 결과가 비는 경우
- 근거 요구사항: R35, R84, R86 (D55, D59)
- 수행 방법: `supabase/functions/_shared/dedupe.ts`를 임시 폴더로 복사하고 임시 스크립트 `a3.ts`를 `node a3.ts`(Node 24 타입 제거 실행)로 돌렸다. 25건
- 예상 결과: 표의 기대값과 모두 일치
- 실제 결과 (모두 실제 실행):
  | 입력 | 실제 | 판정 |
  |---|---|---|
  | `cleanTitle("[스마일게이트RPG] 클라이언트 개발자 경력 채용", "스마일게이트RPG")` | `클라이언트개발자` | 일치 |
  | `cleanTitle("스마일게이트 서버 개발자", "스마일게이트")` | `서버개발자` | 일치 |
  | `cleanTitle("신입 채용", "넥슨")` | `신입채용` (원래 제목 정리값) | 일치 |
  | `normKey` 넥슨 vs 넥슨게임즈 (서버 개발자) | 다름 | 일치 |
  | 스마일게이트/스마일게이트RPG, 마감 같음, `서버 개발자`/`[스마일게이트] 서버 개발자 경력 채용` | 같은 공고 | 일치 |
  | 위와 같고 마감 10/31·11/01 | 다름 | 일치 |
  | `서버 개발자`/`서버개발자(MMORPG)`, 직무 다름 | 다름 (dice 0.571) | 일치 |
  | 같은 사이트끼리 | 다름 | 일치 |
  | pickRep 게임잡(먼저)+자사(나중) | 자사 | 일치 |
  | pickRep 둘 다 자사 아님 | 먼저 수집 | 일치 |
  | D59: 뒤 `(경력)`·`(신입/경력)`·`[넥슨]`·`(넥슨 경력 채용)` | 모두 뺌 → `서버개발자` | 일치 |
  | D59: 뒤 `(MMORPG)` / `(MMORPG)(경력)` | `서버개발자mmorpg` (MMORPG 남고 경력만 뺌) | 일치 |
  | D59: 앞 말머리 반복 `[넥슨] (경력)`, 앞 `[MMORPG]` | 늘 뺌 → `서버개발자` | 일치 |
  | 빈 결과: `채용`·`넥슨`(회사 이름뿐)·`[넥슨 채용]`(말머리뿐) | `채용`·`넥슨`·`넥슨채용` (원래 제목 정리값) | 일치 |
  | `신입 채용` vs `경력 채용` 키 | 다름 | 일치 |
  | `normKey("넥슨","!!!")`, `normKey(null, …)` | null | 일치 |
  | `companyMatch("A","ABC")` (1글자) | false | 일치 |
- 판정: **통과** (25/25)

## A4. 수집 단계 묶기 (js-collect)
- 테스트 내용: 같은 사이트 규칙, 다른 사이트 일치 시 duplicate 저장·원문·AI 없음, 대표 교체, 지원 묶음, 숨김 이동, 응답 개수, D60
- 근거 요구사항: R35, R82, R86–R88, R39, L38 테스트 메모
- 수행 방법: `supabase/functions/js-collect/index.ts`의 `findReps`·`saveNew`·`fetchBodies`·`bodiesOnly`·`run`과 0007 `js_switch_rep` 읽기 (코드 추적, 서버 실행 없음)
- 예상 결과: 규칙대로 구현됨
- 실제 결과:
  - 같은 사이트: 이 사이트의 `ext_id`로 이미 있는 것만 빼고, `findReps`는 `row.site_id === siteId`를 건너뜀 → 같은 사이트는 ext_id로만 판정
  - 다른 사이트 일치: `norm_key`로 다른 사이트·`unbundled=false` 공고를 찾아 대표(`dup_of ?? id`)로 올리고, 여러 묶음이면 `pickRep` (D60). `stage: "duplicate"`, `dup_of` 대표로 upsert
  - 원문 안 받음: `fetchBodies`가 `.neq("stage","duplicate")` (bodiesOnly도 같은 함수). AI 없음: js-process 대기열이 stage `new/waiting/extracted`만 꺼냄
  - 대표 교체: 이 사이트가 자사이고 대표가 자사 아님·지원 안 함일 때만, 대표마다 처음 공고 하나로 `js_switch_rep` → stage·filtered_by·hidden_at·추출·점수 복사. 새 대표는 body_text null·stage≠duplicate라 `fetchBodies`가 원문만 받음(목록 본문이 있으면 listBodies 사용)
  - 지원한 묶음: `rep.applied`면 교체 안 함 (지원한 공고는 늘 대표 쪽이라 묶음 단위로 막힘)
  - 숨김: `js_switch_rep`이 옛 대표 hidden_at을 새 대표에 복사하고 옛 대표·묶인 공고는 null → 숨긴 묶음이 추천에 다시 나오지 않음 (R88)
  - 응답: `added`=단독+새 대표, `bundled`=묶인 수, 교체 시 `added++`·`bundled--`. upsert `ignoreDuplicates`의 반환 행 수로 셈
- 판정: **통과**
- 참고: 사이트 A의 대표 X에 사이트 B 공고 Y가 묶여 있을 때, A에 ext_id가 다른 같은 norm_key 공고 X'가 들어오면 Y(다른 사이트)와 키가 같아 X 묶음에 들어간다. 한 묶음에 같은 사이트 공고가 둘 생길 수 있다(소급 적용은 이를 막지만 수집 단계는 막지 않음). 규칙 위반으로 보지는 않았고, 드문 경우다.

## A5. 예약 이어 하기가 묶인 공고만 남았을 때 bodies를 부르지 않음
- 근거 요구사항: R39, D43
- 수행 방법: 0007의 `js_cron_continue` 읽기, 0004 원본과 비교
- 예상 결과: duplicate 제외 조건 있음
- 실제 결과: 원문 받기 조건에 `and p.stage <> 'duplicate'`가 더해짐(나머지는 0004와 같음). js-process 호출 조건은 stage `new/waiting/extracted`라 duplicate가 원래 빠짐. 앱 쪽 `fetchBodies`도 duplicate 제외 → 남은 수에도 안 잡힘
- 판정: **통과**
