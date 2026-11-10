# 구직 관리 7단계: 사이트 추가·시험 수집·어댑터 가이드

- 요구사항: R28–R30, R32
- 목업: part-add-site.html (add-site-form, add-site-test, add-site-foot), part-adapter-guide.html (adapter-guide-toc, adapter-guide-body)
- 경로 기준: `apps/desktop/src/` (서버는 저장소 `supabase/`)
- 공통 규칙: [index.md](index.md)의 결정 D16, [structure.md](structure.md) 3절 규칙 형식

## 할 일
- `js-collect` `test`: 규칙 + 사이트별 값을 받아 목록만 읽고(상세는 처음 5개만), 저장하지 않고 공고 수·항목별 읽힘 개수·처음 5개를 돌려준다 (R29).
- `adapterRule.ts`: 앱에서 먼저 하는 형식 검사(서버 `adapter.ts`와 같은 필수 칸). 오류는 "list.item이 없어요"처럼 키 이름으로 알려 준다.
- `AddSiteDialog` (1100px): 머리 단계 표시(입력 → 시험 수집 → 저장).
  - 왼쪽: 이름, 주소, 어댑터(기존 고르기 / 규칙 파일 올리기), 규칙의 `vars`에 맞춘 사이트별 값 칸 (R28).
  - 오른쪽 `TestResult`: 초록 성공 줄, 항목별 읽힘 칩, 처음 5개 표.
  - [저장]은 시험 수집이 성공한 뒤에만 켜진다. 입력을 바꾸면 다시 꺼진다.
- 어댑터 교체 (R32): 어댑터 카드 ⋯ → [새 버전 올리기] → 같은 창에서 그 어댑터를 쓰는 사이트 하나로 시험 수집 → 성공하면 `version + 1`로 저장.
- `AdapterGuideDialog` (1080px): 왼쪽 목차, 오른쪽 본문(형식 설명, 게임잡·넥슨 예시, 키 설명 표, AI에게 맡길 때 쓸 프롬프트 틀). 코드 상자에 [복사] (R30). 본문은 `guideContent.ts`, 예시는 `supabase/adapters/*.json`과 같은 내용.

## 확인할 결과
- 필수 칸이 빠진 규칙 파일을 올리면 시험 전에 빠진 키 이름이 빨간 글로 보인다.
- 게임잡 규칙 + 다른 직무 코드로 시험 수집 → 공고 수와 처음 5개가 보이고, 그 뒤 [저장]이 켜진다. 저장하면 표에 새 줄이 생긴다.
- 시험 수집이 0개면 [저장]이 꺼진 채로 이유가 보인다.
- 어댑터 새 버전 올리기 → 시험 성공 후 카드의 버전 숫자가 1 오른다.
- 가이드의 [복사]를 누르면 클립보드에 예시 JSON이 들어간다.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/js-collect/index.ts`, `src-tauri/src/server/migrations.rs`
- `features/job-search/adapterRule.ts`, `guideContent.ts`, `api.ts`
- `pages/job-search/sources/AddSiteDialog.tsx`(+css), `TestResult.tsx`, `AdapterGuideDialog.tsx`(+css), `CodeBox.tsx`
- 수정: `pages/job-search/sources/SourcesTab.tsx`, `AdapterCards.tsx`
