# 구직 관리 1단계: 페이지 틀과 탭

- 요구사항: R1–R3
- 목업: recommend.html (탭 줄), disconnected.html (disconnected)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- 메뉴 추가: `app/types.ts`에 `job-search`, `pageLabels.ts`에 "구직 관리"·`Job Search`, `pages.ts`에서 Applications 다음에 둔다. `NavIcons.tsx`에 돋보기 아이콘.
- `JobSearchPage`: 페이지 제목 "구직 관리" + `JobSearchTabs`. 서버 상태가 연결·로그인 완료가 아니면 탭 대신 `JobSearchDisconnected` (R2).
- `JobSearchTabs`: 밑줄 탭 6개(추천 공고·프로필·필터·수집 사이트·메일 제안·설정). 선택된 탭은 굵게 + 보라 밑줄 2px. 메일 제안 칩 자리는 만들고 값은 14단계에서 채운다. 각 탭 내용은 `TabPlaceholder`.
- `JobSearchDisconnected`: 가운데 구름 아이콘, 안내 글, [서버 연결하기] → 설정 화면(server-setup)으로 이동.
- R3: 공유 웹(apps/web)에는 아무것도 추가하지 않는다. 서버 테이블에도 공개 정책을 두지 않는다(2단계).

## 확인할 결과
- 사이드바 Applications 아래에 `Job Search`(돋보기)가 보이고, 누르면 "구직 관리" 화면과 탭 6개가 나온다.
- 탭을 누르면 밑줄이 옮겨 가고 내용 자리가 바뀐다. 뒤로/앞으로 이동 뒤에도 화면이 깨지지 않는다.
- 서버 연결을 끈 상태(또는 로그아웃)에서는 탭 대신 연결 안내가 보이고, [서버 연결하기]가 설정 화면을 연다.
- `npm run build` 성공.

## 이 단계에서 만들거나 고칠 파일
- `pages/job-search/JobSearchPage.tsx`(+css), `JobSearchTabs.tsx`(+css), `JobSearchDisconnected.tsx`(+css), `TabPlaceholder.tsx`
- 수정: `app/types.ts`, `app/pageLabels.ts`, `app/pages.ts`, `components/icons/NavIcons.tsx`
