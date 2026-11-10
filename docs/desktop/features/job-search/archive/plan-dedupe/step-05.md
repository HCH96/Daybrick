# 구직 관리 수정1 5단계: 처리 단계 중복 확인·소급 적용

- 요구사항: R41 (L33에서 변경), R83–R89 (영향: R47 필터 다시 적용, R53 결과 재사용)
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D17, D35, D37, D53, D54, D55, D56, D57

## 할 일
- 새 `supabase/functions/js-process/dedupe.ts`:
  - `checkDuplicate(ctx, p, fields)`: 후보 = 같은 사용자·다른 사이트·`dup_of` null·`unbundled` false·`js_extractions` 있음·본인 아님·마감이 오늘(한국 시간) 이후이거나 없음. 걸러진·숨긴·지원한 공고도 포함 (R83). 후보를 회사 앞글자로 좁혀 읽고 `isSameJob`(3단계)으로 판정.
  - 묶기: 일치하면 `pickRep([p, 후보 대표])`. 후보가 대표면 p를 `duplicate, dup_of`로 저장 (p의 새 추출은 남겨 둠). p가 이기고 후보 묶음이 지원하지 않은 것이면 `js_switch_rep(user, 후보, p)` → 후보의 추출·점수가 p에 덮여 다시 채점하지 않음 (R87, D53). p가 지원한 공고는 아니므로(처리 중) 지원 규칙은 후보 쪽만 본다.
  - p가 이미 묶인 공고를 가진 대표(필터 다시 적용으로 다시 처리되는 경우)면 묶음 합치기: 진 쪽 대표와 그 묶인 공고 전체를 이긴 쪽으로 옮긴다.
  - `backfillDedupe(ctx)`: 전 공고 norm_key를 새 규칙으로 다시 계산해 저장 → 추출 있는 공고(`unbundled` false)를 회사 앞글자로 모아 `isSameJob`으로 묶음 만들기 → 묶음마다 `pickRep(소급)` → 대표가 아닌 쪽 duplicate (둘 다 지원했으면 묶지 않음) → `js_settings.dedupe_version = 1`. 시간 한도(D37) 안에서 끝나지 않으면 version을 올리지 않고 다음 실행이 처음부터 다시 (같은 결과라 안전).
- `js-process/index.ts`:
  - `processOne`: 추출(인젝션 의심 판정 뒤) → `checkDuplicate` → 묶였으면 `{ kind: "done", stage: "duplicate" }`로 끝, 아니면 2차 필터. 의심 공고는 중복 확인 전에 suspect로 끝난다(기존 순서 유지).
  - `runQueue` 시작 때 `dedupe_version < 1`이면 `backfillDedupe`. force·rescore 모드는 중복 확인을 하지 않는다(D57).
- `server/migrations.rs`: js-process `files`에 `DEDUPE`와 `js-process/dedupe.ts`.

## 확인할 결과
- `cargo check` 성공, 앱 [서버 업데이트] 성공.
- [지금 평가] 한 번 뒤 `select dedupe_version from js_settings` = 1. 한 번 더 눌러도 소급 적용이 다시 돌지 않음 (서버 로그 또는 응답 시간).
- **옮기기 전후 예시** (실제 데이터에 쌍이 없으면 SQL로 시험 행을 만들어 확인):
  - 전: `A(게임잡, 회사 "스마일게이트", 제목 "[스마일게이트] 서버 개발자 경력 채용", 마감 11/15, scored 82, dup_of null)`, `B(스마일게이트 채용(자사), 회사 "스마일게이트RPG", 제목 "서버 개발자", 마감 11/15, scored 80, dup_of null)`
  - 후: `A(stage duplicate, dup_of B)`, `B(scored 80, dup_of null)` — 둘 다 채점이 있어 자사인 B가 대표. `js_postings_backup_0007`에는 A·B의 이전 stage(`scored`)와 옛 norm_key가 남음.
  - 마감이 다른 쌍, `넥슨`/`넥슨게임즈`처럼 앞부분은 같지만 제목이 다른 쌍은 묶이지 않음.
- 새로 수집된 공고가 기존 대표와 묶이면 채점 AI 호출이 없다 (`select count(*) from js_ai_calls where task = 'score'`가 늘지 않음).
- 필터를 하나 바꾼 뒤(`js_refilter`) [지금 평가] → 묶음이 그대로이고 대표만 다시 처리됨 (R47).
- 추천 공고 탭의 카드 수가 묶인 만큼 줄어든다 (출처 줄은 6단계).

## 이 단계에서 만들거나 고칠 파일
- 새 `supabase/functions/js-process/dedupe.ts`
- `supabase/functions/js-process/index.ts`
- `apps/desktop/src-tauri/src/server/migrations.rs`
