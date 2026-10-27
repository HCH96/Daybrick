# 구직 관리 4단계: 프로필

- 요구사항: R17–R22 (R23 표시는 10단계)
- 목업: profile.html (profile-sources, profile-editor, profile-foot)
- 경로 기준: `apps/desktop/src/` (서버는 저장소 `supabase/`)
- 공통 규칙: [index.md](index.md)의 결정 D15, [../spec/ai-rules.md](../spec/ai-rules.md) "자료에 없는 내용은 쓰지 않는다"

## 할 일
- 자료 넣기 (R17): PDF·MD 파일 고르기·끌어 놓기, 텍스트 붙여 넣기. 파일은 Storage `job-search/<user_id>/sources/`, 목록은 `js_profile_sources`. MD·텍스트는 `text` 칸에도 저장한다. 삭제도 된다.
- `js-profile`: 자료를 모아 Opus 5.5에 보낸다 (PDF는 문서 블록 base64). `_shared/ai.ts` 경유, 작업 이름 `profile`.
  - 결과: R19 항목 JSON + 항목별 출처(자료 이름). 모르는 값은 null (R20).
  - 결과는 `js_profile_drafts`에 저장한다. 저장 전에는 기존 프로필이 그대로 쓰인다 (R22).
- `_shared/prompts.ts`: 프로필 프롬프트와 출력 형식. 자료 원문은 데이터 칸에 넣고, 그 안의 지시문은 따르지 않게 한다.
- 편집 판: 초안이면 보라 안내 줄, 항목 오른쪽 위에 출처, 기술스택은 상·중·하 칩, 경력·프로젝트 목록은 줄 추가·삭제. 아래 [초안 버리기] [저장 (vN)].
- 저장 (R21): `js_profiles`에 새 버전 행, `js_settings.profile_version` 갱신, 초안 삭제. 왼쪽 판 아래에 저장된 버전 목록.
- 한도·크레딧 오류는 `messages.ts` 문구로 안내한다.

## 확인할 결과
- PDF 1개 + MD 1개 + 붙여 넣은 텍스트로 [프로필 만들기] → 초안이 채워지고 항목마다 출처 이름이 보인다. 자료에 없는 항목(예: 학력)은 비어 있다.
- 항목 몇 개를 고치고 [저장 (v1)] → 다시 켜도 고친 값이 보이고 버전 목록에 v1.
- 다시 만들기 → 새 초안이 보인다. [초안 버리기]를 누르면 v1 값으로 돌아간다.
- `js_ai_calls`에 `profile` 작업 한 줄(모델 opus, 토큰, 비용)이 생기고, 사용액 줄 숫자가 바뀐다.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/js-profile/index.ts`, `_shared/prompts.ts`, `src-tauri/src/server/migrations.rs`
- `features/job-search/profileDraft.ts`, `api.ts`, `messages.ts`
- `pages/job-search/profile/ProfileTab.tsx`(+css), `SourcePanel.tsx`, `ProfileEditor.tsx`, `ProfileField.tsx`, `SkillChips.tsx`, `ExperienceList.tsx`
