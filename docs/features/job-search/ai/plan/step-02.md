# 구직 관리 수정1 2단계: 수집 사이트 자사 여부

- 요구사항: R90 (영향: R24 사이트 표, R28 사이트 추가)
- 목업: `sources.html` (sources-table), `part-add-site.html` (add-site-form)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D32, D33, D34, D54

## 할 일
- `api.ts`: `loadSources`가 `own_site`를 `Site.ownSite`로 읽는다. 새 `setSiteOwn(session, siteId, own)`. `addSite`에 `ownSite` 인자를 더해 사이트 행에 넣는다.
- `SiteTable.tsx`: 어댑터 칸 다음에 "자사" 칸. 켜짐 칸과 같은 스위치를 쓰고, 바꾸면 `setSiteOwn` → 성공 뒤 `reload()`, 실패면 문구.
- `AddSiteForm.tsx`·`addSiteRules.ts`: "자사 채용 사이트" 체크(기본 꺼짐)와 도움말 한 줄 "회사가 직접 운영하는 채용 사이트면 켜세요. 같은 공고가 다른 사이트에도 있으면 이 사이트 공고를 대표로 보여줘요." 체크를 바꿔도 시험 결과는 지우지 않는다(규칙과 상관없는 값). 새 버전 올리기(`mode: replace`)에는 보이지 않는다.
- `SourcesTab.css`: 칸 폭만.

## 목업과 다른 점
- `sources.html` 사이트 표에 "자사" 칸이 없다 → 어댑터와 켜짐 사이에 스위치 칸을 넣는다 (명세 화면 구성 "이름 · 어댑터 · 자사 · 켜짐 · 결과 · 시각").
- `part-add-site.html` 입력 줄에 자사 체크가 없다 → 사이트별 값 아래에 체크 한 줄.

## 확인할 결과
- `npx tsc --noEmit`, `npm run build` 성공.
- 수집 사이트 탭에 자사 칸이 있고 넥슨 켜짐·게임잡 꺼짐(1단계 값).
- 게임잡 자사를 켜고 다른 탭에 갔다 오면 유지, 다시 끄면 꺼짐 (SQL `own_site`도 같음).
- 사이트 추가에서 체크하고 시험 수집 → 저장하면 표에 자사 켜짐. 체크하지 않으면 꺼짐.
- 이전 테스트 r1 4번(수집 사이트와 지금 수집)·5번(사이트 추가·시험 수집)이 전처럼 동작 (켜기·끄기·지우기·시험 수집·저장).

## 이 단계에서 만들거나 고칠 파일
- `features/job-search/api.ts`
- `pages/job-search/sources/SiteTable.tsx`, `AddSiteForm.tsx`, `addSiteRules.ts`, `SourcesTab.css` (필요하면 `AddSiteDialog.tsx`에서 값 넘기기)
