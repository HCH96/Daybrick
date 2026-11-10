# 구직 관리 수정2 7단계: 기존 공고 직군 채우기·옮기기

- 요구사항: R99, R100, R47 (L44에서 변경) (영향: R46 걸러진 공고)
- 목업: `filtered.html` filtered-rows 구역 (CSS: recommend.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D37, D39, D56, D69, D70, D71, D73, D74, D75

## 할 일
- `_shared/prompts.ts`: `FAMILY_SYSTEM`·`FAMILY_SCHEMA`(`{ family }`)와 `familyContent(meta, fields)`(제목·회사·직무 + 추출 항목의 직무·자격 요건 앞부분만, 원문은 보내지 않음).
- 새 `js-process/familyBackfill.ts` (D75, 사용자 결정):
  - `batch` 모드 맨 앞에서 `family_version < 1`이면 실행. 대상 = `js_extractions.fields->>'family'`가 없는 공고(숨김·지원 포함, duplicate 제외).
  - 대상이 있으면 `kind family` 일괄 하나로 맡긴다(Haiku, 월 한도 검사·예상 비용은 4단계와 같음). 이 일괄이 진행 중이면 다시 맡기지 않는다.
  - 결과 저장 (`pollBatches`에 `family` 분기): `fields.family`만 채운다(`jsonb_set`). 실패·만료는 `unknown`으로 둔다 (다시 묻지 않음, R101대로 통과).
  - 직군 일괄을 다 저장하면 옮기기: `dev-only`가 켜져 있으면 `scored`이고 비개발 직군인 공고를 `filtered2`(`filtered_by` dev-only hit)로. 점수 행은 지우지 않는다 (R99). 끝나면 `family_version = 1`.
  - 백업은 1단계의 `js_postings_backup_0008`로 이미 있다.
- force (`runForce`, R99·D73): 지금 프로필 버전 점수가 있으면 AI를 부르지 않고 `stage = 'scored'`, `filtered_by = null`. 없으면 기존대로 채점.
- 일반 처리의 2차 필터는 3단계에서 직군을 보므로, 새 공고는 따로 할 일이 없다. 필터를 바꿀 때의 예외는 1단계 `js_refilter`.

## 확인할 결과
- `cargo check` 성공, [서버 업데이트] 성공.
- 업데이트 뒤 첫 batch 실행에서 `js_batches`에 `kind family` 행 → 끝난 뒤 다음 실행에서 `saved`, `select count(*) from js_extractions where fields->>'family' is null` = 0, `family_version = 1`.
- **옮기기 전후 예시**:
  - 전: `P(제목 "캐릭터 원화가", stage scored, filtered_by null, js_scores 62점, fields.family 없음)`
  - 후: `P(stage filtered2, filtered_by [{kind:"dev-only", matched:["art"]}], js_scores 62점 그대로, fields.family "art")`. 백업 표의 P 행은 `stage scored`.
  - "서버 프로그래머"(dev)·직군 판단 불가(unknown) 공고는 `scored` 그대로.
- 걸러진 공고 목록에 P가 "직군: 아트" 칩과 함께 나오고, [그래도 채점] → AI 호출 없이(`js_ai_calls` 늘지 않음) 추천에 62점으로 돌아온다.
- 필터 탭에서 "개발 직군만"을 끄면 P가 다시 처리돼 점수 재사용으로 추천에 돌아오고, 켜면 다시 걸러진다 (R47 예외).
- 이전 사용자 테스트 r2 7번(지원 안 함·보관함·걸러진 공고·필터 바꾸기)을 이 단계 뒤 다시 한다.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/prompts.ts`, 새 `js-process/familyBackfill.ts`, `js-process/batchResult.ts`·`index.ts`
- `apps/desktop/src-tauri/src/server/migrations.rs`
