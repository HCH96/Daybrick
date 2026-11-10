# r3 AI 테스트: 묶기 (A14, A15, A18, A19) — req-dedupe

공통 수행 방법: 순수 함수는 `node t_pure.ts`(`_shared/dedupe.ts` 복사본)로, `checkDuplicate`는 `node t_family_pair.ts`(메모리 DB 흉내 + 바로 호출 fetch 흉내)로 실행했다. 실제 DB·Anthropic이 아니다.

## A14. 같은 사이트 재등록 (isRelisted·saveNew)
- 테스트 내용: `isRelisted` 4가지 경우, 애매할 때 건너뛰기, 새 대표가 이어받는 것, 응답 개수
- 근거 요구사항: R111, R112, R16 (L53, D66, D76)
- 수행 방법: `isRelisted` 실행. `js-collect/index.ts` `findRelists`·`saveNew`·`run`, 0007 `js_switch_rep`을 읽었다
- 예상 결과: 기대대로
- 실제 결과:
  | 경우 (실행) | 결과 |
  |---|---|
  | (1) 기존 ext "100"이 목록에 없음, 새 "200" | 참 |
  | (2) 둘 다 목록에 있음 | 거짓 |
  | (3) 제목이 "서버 개발자 (경력)"만 다름 | 참 (`cleanTitle`) |
  | (4) 회사 넥슨/넥슨게임즈 | 거짓 (회사 정확히 같아야 함) |
  | 다른 사이트 / 같은 ext / 제목 다름 | 모두 거짓 |
  - 애매할 때 (코드): 같은 norm_key의 새 공고가 둘 이상이면 그 키는 판정하지 않는다. 걸린 기존 공고가 여러 묶음이면(`groups.size !== 1`) 건너뛴다
  - 이어받기 (코드): 대표가 걸리고 지원하지 않았으면 새 공고를 일반 공고로 넣고 `js_switch_rep(옛, 새)`를 부른다. 이것이 stage·filtered_by·hidden_at·추출·점수를 복사하므로, 점수를 재사용하고 숨김(지원 안 함)도 이어받는다. 지원한 대표이거나 묶인 공고만 걸렸으면 새 공고를 그 대표 아래 `duplicate`로 넣는다 → 지원한 공고가 대표로 남는다
  - 셈 (코드): 재등록은 `relisted`로 세어 `bundled`에만 더한다. `added`는 늘리지 않는다. 재등록으로 묶인 공고는 `candidates`에서 빠져 다른 사이트 판정을 하지 않는다
  - 목록 읽기가 실패한 사이트는 `judgeList`에서 걸려 `saveNew`를 부르지 않는다 → 판정하지 않음
- 판정: **통과**

## A15. 애매한 쌍 판정
- 테스트 내용: `pairKind` 표(step-09), 판정 저장, 같은 쌍 재질문 없음, 한도, 판단 불가
- 근거 요구사항: R113–R115, R84 (L54, D77)
- 수행 방법: `pairKind` 실행. `checkDuplicate`(→`judgePairs`)를 메모리 DB로 실행했다. AI 응답은 fetch 흉내로 same·different·unknown을 골라 돌려주게 했다
- 예상 결과: 기대대로
- 실제 결과 (실행):
  | pairKind 경우 | 결과 |
  |---|---|
  | "서버 개발자" / "서버 개발자(MMORPG)", 마감 같음 | ambiguous (Dice 0.571) |
  | "서버 개발자" / "서버 개발자", 마감 11/15·없음 | ambiguous |
  | "서버 개발자" / "서버 개발자", 마감 같음 | same |
  | "서버 개발자" / "클라이언트 개발자", 마감 같음 | different |
  | 넥슨 / 넥슨게임즈 | `companyMatch` 참(앞부분 일치, D55) → 제목·마감이 같으면 same |
  | 같은 사이트 | different |
  | 직무 같음·마감 다름 | ambiguous |
  | checkDuplicate | 결과 |
  |---|---|
  | AI 답 unknown | 묶지 않음. `js_pair_checks`에 `(c1, me, unknown)` 한 행(a < b) |
  | 같은 쌍 다시 처리 | 묻지 않음. 바로 호출 1번, `task dedupe` 기록 1행 그대로 |
  | AI 답 same | 묶음 (먼저 수집된 c1이 대표, me는 duplicate·dup_of c1) |
  | AI 답 different | 묶지 않음, 저장 |
  | 하루 한도 넘음 | 묻지 않음(호출 0), 저장 0, 묶지 않음 |
  | 애매한 후보 4개 | 최대 3쌍만 물음 |
- 판정: **통과**

## A18. 팝업 출처 칩·따로 보기
- 테스트 내용: 대표 표시, 지원한 공고의 메뉴 꺼짐, 대표를 풀면 다시 고르기, 풀린 공고가 다시 묶이지 않음, 출처 하나면 칩 줄 없음
- 근거 요구사항: R92, R93
- 수행 방법: `PopupSources.tsx`, `PostingPopup.tsx` `unbundle`·`<PopupSources>`, `bundleApi.ts`, 0007 `js_unbundle`, `js-process/dedupe.ts` 후보 쿼리, `js-collect` `findReps`·`findRelists`를 읽었다
- 예상 결과: 기대대로
- 실제 결과:
  - 칩: `loadBundleSources`가 대표를 맨 앞에 두고 `isRep true`. 칩에 "· 대표"를 붙이고, 누르면 그 공고 링크를 연다
  - 출처 하나: `sources.length < 2`면 `null` → 칩 줄이 없다. 묶인 공고가 없는 대표는 맵에 넣지 않는다
  - 지원한 공고: `locked={detail.appliedAt !== null}` → 메뉴 항목 모두 `disabled`, 툴팁 "지원한 공고는 묶음을 풀 수 없어요."
  - 대표 풀기: `js_unbundle`이 묶인 공고 중 자사 사이트 먼저 → 먼저 수집 → id 순으로 새 대표를 고르고(R86, 묶인 공고는 지원한 공고일 수 없음) `js_switch_rep` 뒤 옛 대표를 `unbundled true, stage new`로 바꾼다. 팝업은 대표를 풀었으면 닫는다
  - 다시 안 묶임: `checkDuplicate`는 `unbundled`면 판정하지 않고, 후보도 `unbundled = false`만 본다. 수집 단계 `findReps`·`findRelists`도 `unbundled = false`만 본다
- 판정: **통과**

## A19. 회귀: r2 묶기 순수 함수
- 테스트 내용: r2 A3과 같은 입력으로 결과가 바뀌지 않았는지 (`isSameJob`이 `pairKind === "same"`으로 바뀐 뒤)
- 근거 요구사항: R83–R89
- 수행 방법: r2 `dedupe-collect.md` A3 표의 입력을 다시 실행
- 예상 결과: r2와 같은 결과
- 실제 결과 (실행, 14건): `cleanTitle` 말머리·상투어·회사 이름·상투어뿐 → `클라이언트개발자`·`서버개발자`·`신입채용`. normKey 넥슨≠넥슨게임즈. 스마일게이트/스마일게이트RPG는 마감이 같으면 같은 공고, 10/31·11/01이면 다름. `서버 개발자`/`서버개발자(MMORPG)`는 다름(Dice 0.571). 뒤 `(경력)`은 빼고 `(MMORPG)`는 남김. `companyMatch("A","ABC")` false, normKey 빈 값 null. pickRep: 자사 우선, 먼저 수집, 지원 우선, 소급 때 채점 우선 → 모두 r2와 같다
- 판정: **통과**
