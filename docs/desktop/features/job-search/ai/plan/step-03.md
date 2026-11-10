# 구직 관리 수정2 3단계: 직군 추출·직군 필터

- 요구사항: R48 (L44에서 변경), R96–R98, R101, R47 (L44에서 변경) (영향: R46 걸린 조건 표시)
- 목업: `filters.html` filters-first·filters-second 구역, `popup.html` popup-fields 구역, `filtered.html` filtered-rows 구역 (CSS: common.css·manage.css·popup.css·recommend.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D10, D27, D35, D36, D45, D65, D74

## 할 일
- 서버 `_shared/prompts.ts`: `EXTRACT_SCHEMA`에 `family`(enum `dev|art|design|qa|business|other|unknown`)를 더하고, `EXTRACT_SYSTEM`에 D65의 범위(개발로 보는 직무 / 거르는 직무 / 모르면 unknown)를 짧게 적는다.
- 서버 `_shared/filters.ts`:
  - `applyFirst`: `title-nondev`는 제목·직무에 낱말이 있으면 거른다. 단 같은 글에 개발 낱말(`프로그래머`·`개발`·`엔지니어`, 코드 상수)이 함께 있으면 통과 (R96).
  - `applySecond`: `ExtractionForFilter`에 `family`를 더하고, `dev-only`가 켜져 있으면 `family`가 `dev`·`unknown`·null이 아니면 거른다. hit는 `{ kind: "dev-only", matched: [family] }` (R98, R101).
  - `js-process/steps.ts`의 `forFilter`가 `family`를 넘긴다.
- 앱:
  - `filterRules.ts`: `title-nondev`(1차, 낱말 제외 빨강 칩)를 `KIND_INFO`·`FIRST_KINDS`에 넣어 낱말을 더하고 뺄 수 있게 한다. `dev-only`는 `skill-overlap`처럼 추가할 수 없는 스위치 줄이다.
  - `api.ts` `loadFilters`: 두 기본 줄이 없으면 넣는다 (0008과 같은 값, D74).
  - `FilterPanel.tsx`·`FilterAddRow.tsx`: 두 줄 표시. `dev-only` 줄 설명 "개발 직군만 (직군이 개발·판단 불가인 공고만 통과)".
  - `postingParse.ts`: `PostingFields.family`. `postingFormat.ts` `hitLabel`: `dev-only`는 "직군: 아트"처럼 한국어 이름, `title-nondev`는 "비개발 낱말: 원화". `hitStage`는 각각 2·1.
  - `popup/FieldTable.tsx`: 직무 아래 "직군" 줄 (없으면 "—").

## 목업과 다른 점
- 필터 탭 1차 판에 "비개발 직군 낱말" 줄, 2차 판에 "개발 직군만" 스위치 줄이 더 있다. 팝업 추출 항목 표에 "직군" 줄이 더 있다.

## 확인할 결과
- `npm run build` 성공.
- Node로 `filters.ts` 순수 함수 실행 (예: scratchpad에서 복사해 실행):
  - "UI 원화 아티스트" → 1차에서 걸림, hit `title-nondev` ["원화"]
  - "테크니컬 아티스트 엔지니어" → 1차 통과 (개발 낱말 함께)
  - 2차 `family: "art"` → 걸림, `"unknown"`·`"dev"`·없음 → 통과
- 필터 탭에서 비개발 낱말 하나를 더하고 지울 수 있고, "개발 직군만"을 끄고 켤 수 있다 (바꾸면 `js_refilter` 호출, D35).
- 서버 반영은 [서버 업데이트] 뒤 [그래도 채점] 한 건으로 확인: 새로 추출된 공고 팝업에 "직군" 줄이 보인다.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/prompts.ts`, `_shared/filters.ts`, `js-process/steps.ts`
- `apps/desktop/src/features/job-search/filterRules.ts`·`api.ts`·`postingParse.ts`·`postingFormat.ts`
- `apps/desktop/src/pages/job-search/filters/FilterPanel.tsx`·`FilterAddRow.tsx`
- `apps/desktop/src/pages/job-search/popup/FieldTable.tsx`
