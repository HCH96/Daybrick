# 프로젝트 3단계: 상세 머리·진행 판·뒤로가기

- 요구사항: R4, R16–R18, R20–R24, R26–R28
- 목업: `detail.html` detail-head·detail-progress 구역, `detail-weekly.html` weekly-progress 구역, `part-campfire.html` campfire-levels (CSS: detail.css·common.css에서 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3, D7, D9

## 할 일
- 방문 기록 (D7, R4): `useHistory`의 기록 한 칸을 `{ page, sub? }`로. `navigate(page, sub?)` — 같은 page·sub면 쌓지 않음. `Navigation`에 `currentSub`. 기존 `navigate(page)` 호출은 그대로 둔다. 사이드바에서 Projects를 누르면 sub 없이(목록).
- 전환: `ProjectsPage`는 `currentSub`가 있는 프로젝트 id면 `ProjectDetail`, 없거나 지워진 프로젝트면 목록. 카드 누르기 → `navigate("projects", id)`.
- 머리 (R21): `DetailHead` — ← (뒤로가기 `goBack`, 기록이 없으면 목록으로) · 색 점 · 이름 · 종류 칩 · 오른쪽 `단계 편집`/`주차 편집`(5단계에서 연결, 지금은 자리만) · `…`(2단계 `CardMenu` 재사용, 삭제하면 목록으로).
- 진행 판 (R21–R24): `ProgressPanel` 왼쪽 `FlagTrack` — 위 `<현재 단계> 진행 중 · 전체 태스크 N/M 완료`, 단계 시작점마다 같은 간격 깃발, 끝 결승 깃발. 끝난 단계는 프로젝트 색 펄럭이는 깃발 + 체크, 나머지 회색 늘어진 깃발. 깃발 아래 단계 이름(현재 단계는 프로젝트 색), 주차형은 그 주 시작일.
- 캐릭터 (R23–R24): 위치 = `runnerPosition` / 단계 수. 위치가 바뀌면 이전 자리에서 달려가는 CSS 전환(달리는 그림으로 바꿨다가 도착하면 서기).
- 오른쪽 250px (R26–R28): 큰 모닥불(60px, `fireByLastDay`) + `마지막 작업 <오늘/어제/N일 전/아직 없음>`, 그 아래 `누적 투입 시간` 숫자(애니메이션 없음, 실행 중 구간 포함), 타이머 실행 중이면 `● 타이머 진행 중`.

## 확인할 결과
- `npm run build` 성공.
- 카드를 누르면 상세가 열린다. ←, 제목 표시줄 뒤로 버튼, 마우스 뒤로 버튼 모두 목록으로 돌아오고, 앞으로 버튼으로 다시 상세가 열린다.
- 단계형: 깃발 개수 = 단계 수 + 결승 깃발. 주차형: 깃발 아래 `11/2`, `11/9`…, 오늘 주차가 프로젝트 색.
- (4단계 뒤 다시 확인) 태스크를 완료하면 끝난 단계 깃발이 바뀌고 캐릭터가 새 자리까지 달려간다.
- 투데이에서 이 프로젝트 태스크로 타이머를 돌리면 모닥불이 활활, `오늘`, 누적 시간이 1분 단위로 늘고 `● 타이머 진행 중`이 보인다. 일시정지하면 진행 중 표시가 사라진다.
- 다른 메뉴로 갔다가 사이드바 Projects를 누르면 목록이 열린다.

## 이 단계에서 만들거나 고칠 파일
- `app/useHistory.ts`, `app/navigation.ts` (그리고 `navigate`를 넘기는 `App.tsx`)
- 새 `pages/projects/detail/ProjectDetail.tsx`, `DetailHead.tsx`, `ProgressPanel.tsx`, `Detail.css`
- 새 `pages/projects/common/FlagTrack.tsx`
- `pages/projects/ProjectsPage.tsx`, `list/ProjectCard.tsx`
