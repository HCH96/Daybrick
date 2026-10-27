# 구직 관리 6단계: 수집 사이트 탭

- 요구사항: R24, R31, R34 (R26 공유 표시 포함)
- 목업: sources.html (sources-bar, sources-table, sources-adapters)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- `SourcesTab`: 위쪽 오른쪽 [어댑터 가이드] [지금 수집] [사이트 추가]. 가이드·추가 창은 7단계에서 연결하고, 지금은 단추만 둔다.
- `SiteTable`: 켜짐 스위치 · 사이트(이름·주소) · 어댑터 · 사이트별 값 · 마지막 결과(공고 수 / 빨간 실패 칩과 아래 회색 이유) · 시각 · ⋯ (R24).
- `SiteRowMenu`(⋯): 끄기/켜기, 삭제(확인 창, "이미 모은 공고는 남아요") (R31). 삭제는 `js_sites` 행만 지우고 `js_postings.site_id`는 null로 둔다.
- [지금 수집] (R34): `js-collect run` 호출. 도는 동안 단추에 진행 표시, 끝나면 표 새로고침과 "새 공고 N개" 안내.
- `AdapterCards`: 어댑터 카드 4열. 이름·버전·기본 여부, "사이트 N곳이 함께 씀", 마지막 수집 실패 칩.

## 확인할 결과
- 표에 게임잡(넥슨) 사이트가 결과·시각과 함께 보인다. 5단계에서 실패시킨 사이트는 빨간 칩과 이유가 보인다.
- 사이트 하나를 끄고 [지금 수집] → 꺼진 사이트의 시각은 그대로, 켜진 사이트만 갱신된다.
- 사이트를 삭제해도 그 사이트에서 모은 공고 행은 `js_postings`에 남는다.
- 어댑터 카드에 "사이트 N곳이 함께 씀"이 실제 개수로 나온다.
- `npm run build` 성공.

## 이 단계에서 만들거나 고칠 파일
- `pages/job-search/sources/SourcesTab.tsx`(+css), `SiteTable.tsx`, `SiteRowMenu.tsx`, `AdapterCards.tsx`
- `features/job-search/api.ts`, `messages.ts`
