# r3 AI 테스트: 직군 거르기 (A3, A4, A5, A13) — req-analysis

공통 수행 방법: `_shared/filters.ts`·`dedupe.ts`와 앱 `filterRules.ts`·`postingFormat.ts`를 임시 폴더로 복사하고 import 경로만 `.ts`로 고친 뒤 `node t_pure.ts`로 실행했다(Node 24 타입 제거). A13은 `node t_family_pair.ts`로 실행했다(메모리 DB 흉내 + fetch 흉내).

## A3. 1차 비개발 낱말
- 테스트 내용: 기본 낱말로 `applyFirst`를 실행하고, 개발 낱말이 함께 있으면 통과하는지 확인
- 근거 요구사항: R96
- 수행 방법: `applyFirst({title, duty, company}, [title-nondev 기본 낱말 7개])` 실행
- 예상 결과: "UI 원화 아티스트"는 title-nondev ["원화"]로 걸리고, "테크니컬 아티스트 엔지니어"는 통과
- 실제 결과 (모두 실행):
  | 입력 | 결과 |
  |---|---|
  | UI 원화 아티스트 | 걸림 `{kind:"title-nondev", matched:["원화"]}` |
  | 테크니컬 아티스트 엔지니어 | 통과 |
  | 3D 캐릭터 모델러 | 걸림 ["모델러"] |
  | 레벨 기획자 | 걸림 ["기획"] |
  | 이펙트 프로그래머 | 통과 |
  | 제목 "원화 툴", 직무 "툴 개발" | 통과 (직무의 개발 낱말도 본다) |
  | 서버 개발자 | 통과 |
  | 조건 꺼짐 + "원화가" | 통과 |
- 판정: **통과**

## A4. 2차 "개발 직군만"과 걸린 조건 칩
- 테스트 내용: `applySecond`의 dev-only 판정과 앱 `hitLabel` 문구
- 근거 요구사항: R98, R101
- 수행 방법: `applySecond({family}, null, [dev-only])`, `hitLabel({kind:"dev-only", matched:[…]})` 실행
- 예상 결과: art만 걸리고 칩은 "직군: 아트". unknown·dev·없음은 통과
- 실제 결과: art → 걸림 `matched ["art"]`. qa → 걸림. unknown·dev·null → 통과. 칩은 `"2차 · 직군: 아트"`, business는 `"2차 · 직군: 사업·운영"`, title-nondev는 `"1차 · 비개발 낱말: 원화"`. 앞의 `N차 · `는 모든 칩에 붙는 기존 형식이다
- 판정: **통과**

## A5. 추출 프롬프트·도구 스키마의 직군
- 테스트 내용: 추출 스키마에 직군 칸이 필수이고 값이 7개인지, 기준이 D65 범위와 같은지
- 근거 요구사항: R48, R97 (D65)
- 수행 방법: `_shared/prompts.ts`의 `EXTRACT_SCHEMA` fields(108–149행), `FAMILY_RULE`(164행), `EXTRACT_SYSTEM` 7번(177행), `FAMILY_VALUES`·`FAMILY_SCHEMA`를 grep으로 찾아 읽었다
- 예상 결과: 직군 칸 필수, 값 7개
- 실제 결과:
  - `fields.family`: `type string`, enum `dev, art, design, qa, business, other, unknown` 7개. `required`에 `family`가 있다
  - 직군 채우기 스키마(`FAMILY_SCHEMA`)도 같은 7개 값(`FAMILY_VALUES`)을 쓰고 `required ["family"]`
  - `FAMILY_RULE`: dev = 클라이언트·서버·엔진·툴·웹·모바일 프로그래머, DevOps·인프라, 데이터 엔지니어, AI·ML 엔지니어, QA 자동화(SDET), 보안 엔지니어. 테크니컬 아티스트는 art, 테크니컬 디자이너는 design, 일반 QA는 qa, PM·PD와 데이터 분석가는 business. 정할 수 없으면 unknown → D65와 같다. 추출과 직군 채우기가 같은 글을 쓴다
  - 앱 `FAMILY_LABEL`의 7개 화면 이름(개발·아트·기획·QA·사업·운영·기타·판단 불가)도 같은 값이다
- 판정: **통과**

## A13. 직군 채우기·옮기기 (step-07 전후 예시)
- 테스트 내용: `ensureFamilyBackfill`을 두 번 실행한다(1회: 맡기기, 2회: 결과 저장·옮기기). 그 뒤 `js_refilter` 동작을 읽는다
- 근거 요구사항: R47, R99, R100 (L52, D75)
- 수행 방법: `js-process/familyBackfill.ts`를 메모리 DB 흉내로 실행했다(fetch 흉내가 Batch 만들기·상태·결과 JSONL을 돌려줌). 0008의 `js_refilter`, 앱 `FiltersTab.tsx`의 `change`→`refilter`를 읽었다
- 예상 결과: step-07 예시와 같음
- 실제 결과 (실행):
  | 확인 | 결과 |
  |---|---|
  | 1회차 대상 | 직군 없는 공고 8개(숨김 H 포함, duplicate DUP 제외)를 family 일괄 **하나**로 맡김. 공고 batch_id는 채우지 않음. family_version은 0 그대로 |
  | P "캐릭터 원화가" scored 62점 → art | `stage filtered2`, `filtered_by [{id:"f-dev", kind:"dev-only", matched:["art"]}]`, js_scores 62 그대로, `fields.family "art"` |
  | D(dev)·K(unknown) | scored 그대로 |
  | X expired | `family "unknown"`, scored 그대로 |
  | W(waiting)·E(extracted) | 둘 다 filtered2 (E는 design) |
  | BB(batch_id 있음, art) | family는 채우지만 stage scored 그대로 (안 건드림) |
  | 숨긴 H | filtered2, 숨김 유지 |
  | 끝 | `family_version = 1`, 일괄 saved, 직군 일괄 비용 기록 7행(batch true, 만료 X 제외) |
  | 3회차 | family_version 1 → 아무것도 하지 않음 (Batch 호출 0) |
  - dev-only를 바꿀 때(코드 읽기): `FiltersTab.change`가 조건을 바꾸면 `refilter`(rpc `js_refilter`)를 부른다. 0008 `js_refilter`는 ① 채점 전 단계(batch_id 없음)를 new로 되돌리고 ② dev-only가 켜져 있으면 `scored`이고 batch_id가 없으며 `fields.family`가 dev·unknown·null이 아닌 공고를 `filtered2`·`[{id, kind:"dev-only", matched:[family]}]`로 옮긴다. 점수는 지우지 않는다. dev-only를 끄면 ①에서 filtered2가 new로 돌아가고, 다음 batch 실행 때 추출·점수를 다시 써서 AI 없이 scored가 된다(A7 실행 결과로 확인)
  - 백업 표는 0008 적용 때 P의 stage `scored`를 담는다(A2)
- 판정: **통과**
- 참고 (코드 추적, 재현하지 않음): 서버 업데이트 직후 첫 batch 실행에서는 직군 일괄을 맡긴 뒤 같은 실행에서 `submitBatches`가 돈다. 이때 옛 추출(직군 없음)을 가진 waiting·extracted 공고는 dev-only를 통과해 채점 일괄로 갈 수 있다. 직군 결과가 왔을 때 아직 채점 일괄 안이면(batch_id) 옮기기에서 빠지고, 그 뒤 채점 결과가 `scored`로 둔다. 그래서 art 공고가 추천에 남을 수 있다. 수정한다면 채점 결과를 저장할 때 dev-only를 다시 보거나, family_version을 1로 올리기 전에 진행 중 채점 일괄이 끝나기를 기다리면 된다.
