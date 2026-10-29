# 구직 관리 8단계: 필터 탭

- 요구사항: R42–R45, R47 (R41 처리 순서 표시 포함)
- 목업: filters.html (filters-flow, filters-first, filters-second)
- 경로 기준: `apps/desktop/src/` (서버는 저장소 `supabase/`)
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙, [structure.md](structure.md) 2절 필터 종류

## 할 일
- `_shared/filters.ts` (순수 함수):
  - `applyFirst(posting, filters)`: 제목·직무 키워드 포함/제외, 회사 제외 (R42).
  - `applySecond(extraction, profile, filters)`: 기술스택 포함/제외, 경력 연수 기준, 고용 형태, 기술스택 자동 추림(프로필과 하나도 안 겹치면 걸러냄) (R43–R44).
  - 둘 다 `{ pass: true } | { pass: false, hits: 조건[] }`를 돌려준다. 켜진 조건은 모두 만족해야 통과 (R45).
- `FiltersTab`: 맨 위 `FlowLine`(수집 → 1차 → 추출 → 2차 → 채점, 이번 주 단계별 개수, AI 단계는 보라 테두리). 아래 1차·2차 `FilterPanel` 나란히.
- `FilterRow`: 스위치 + 종류 + 값 칩(포함 보라, 제외 빨강, 숫자 기준 파랑) + 휴지통. 꺼진 조건은 흐리게. `FilterAddRow`: 종류 고르기 + 값 입력 + [추가].
- 기술스택 자동 추림은 2차 판의 고정 줄(스위치만, 삭제 없음).
- 필터를 바꾸면 (R47): 아직 채점하지 않은 공고(`stage`가 `new`·`filtered1`·`extracted`·`filtered2`)의 단계를 되돌려 다음 처리 때 다시 적용되게 하는 RPC `js_refilter()`. 채점한 공고는 그대로.

## 확인할 결과
- 1차에 "제목 제외: 인턴", 2차에 "경력 5년 이상 요구 제외"를 추가하고 하나를 끈 뒤 앱을 다시 켜도 그대로다.
- 처리 순서 줄에 단계별 개수가 나온다 (처리 전이라 수집 개수만 있어도 된다).
- 필터 순수 함수를 예시 공고 몇 개로 돌려(Deno 또는 node 스크립트) 통과·걸림과 걸린 조건이 맞게 나온다.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/filters.ts`, `migrations/0003_job_search.sql`(`js_refilter`)
- `features/job-search/filterRules.ts`, `api.ts`
- `pages/job-search/filters/FiltersTab.tsx`(+css), `FlowLine.tsx`, `FilterPanel.tsx`, `FilterRow.tsx`, `FilterAddRow.tsx`
