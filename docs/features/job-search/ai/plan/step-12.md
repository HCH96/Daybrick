# 구직 관리 12단계: 지원하기·일정 제안 (지원 관리 수정)

- 요구사항: R54–R59
- 목업: part-schedule.html (apply-schedule-done, -list, -vague)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정 D1·D2(명세), D20, D21

## 할 일
- 지원 관리 수정 (D20): `features/applications/types.ts`의 `Application`에 선택 칸 `jobLink?: { serverId: string } | null`. 파일 version 2 그대로 (옛 카드는 칸이 없음 = 연결 없음). `store.tsx`에 다른 기능이 카드를 만드는 동작 `createFromJob(card)`.
- `buildCard.ts` (R54): 공고 → 카드. 상태 "지원 준비", 제목·회사·직무·공고 링크·경력 구분·고용 형태 속성(이름으로 찾고 없으면 비움), 본문 마크다운에 자격·우대·적합도 요약.
- [지원하기]: `js_applications`에 지원 건(공고, 회사, 메일 도메인, 카드 id, 상태) 만들기 → 카드 만들기(`jobLink.serverId`) → 공고 `applied_at` 기록 (R57).
  - 메일 도메인은 공고 링크·회사 홈페이지 도메인에서 뽑는다. 채용 플랫폼 도메인(gamejob 등)은 빼고 비워 둔다.
- `scheduleSuggest.ts` (R55–R56): 추출 항목의 지원 마감·과제 마감·코딩테스트·면접 중 날짜가 정확한 것만 제안. 부정확한 것(예: "3월 중")은 본문에만 적는다.
- `ScheduleSuggestDialog` (600px): 초록 "카드를 만들었어요" 줄, 체크 목록(모두 체크된 채 열림), 점선 상자에 날짜 불명확 일정, [건너뛰기] [선택한 N개 추가] → 카드 `events`에 추가.
- `statusSync.ts` (R58–R59): 지원 관리에서 `jobLink`가 있는 카드의 상태가 바뀌면 서버 지원 건 상태를 갱신. 실패하거나 연결이 없으면 `localState.pendingStatus`에 쌓고 다음 연결 때 반영. 카드를 지우거나 종료로 바꾸면 `closed = true`.

## 확인할 결과
- 팝업 [지원하기] → 일정 제안 창이 열리고, 정확한 날짜만 체크 목록에, "3월 중" 같은 것은 점선 상자에 보인다.
- [선택한 2개 추가] → Applications 화면에 "지원 준비" 카드가 있고, 속성·본문 요약·전형 일정 2개가 들어 있다.
- 그 공고는 추천 목록에서 빠진다.
- 카드 상태를 "지원 완료"로 바꾸면 `js_applications.status`가 바뀐다. 서버 연결을 끈 채로 바꾸면 `job-search.json`의 대기 목록에 쌓였다가, 연결 뒤 반영된다.
- 카드를 지우면 `closed`가 true가 된다.
- 기존 카드(연결 없음)의 열기·편집·달력이 전과 같이 동작한다.
- `npm run build` 성공.

## 이 단계에서 만들거나 고칠 파일
- `features/job-search/buildCard.ts`, `scheduleSuggest.ts`, `statusSync.ts`, `localState.ts`, `api.ts`
- `pages/job-search/popup/ScheduleSuggestDialog.tsx`(+css), 수정 `PopupFoot.tsx`, `PostingPopup.tsx`
- 수정: `features/applications/types.ts`, `reducer.ts`, `store.tsx`
