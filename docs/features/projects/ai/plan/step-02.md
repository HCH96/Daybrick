# 프로젝트 2단계: 목록 카드·만들기·메뉴·완료 묶음

- 요구사항: R3, R5–R12, R19, R27 (카드 모닥불)
- 목업: `projects.html` projects-cards·projects-add·projects-done 구역, `part-create.html` create-stage·create-weekly, `part-campfire.html` campfire-small (CSS: projects.css·parts.css·common.css에서 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3, D9

## 할 일
- 시간 훅 (D9): `useProjectClock` — 플랜·투데이 데이터와 `useNow(실행 중, 10_000)`으로 프로젝트별 누적·이번 주·마지막 작업일, 실행 중 프로젝트 id. 분 단위 값이 같으면 같은 객체를 돌려준다.
- 그림 (목업 icons.js): `common/ProjectIcons.tsx`에 flag-done·flag-todo·finish·runner·fire-* 심볼. `common/Campfire.tsx`(크기 26 / 60, `Fire` 값).
- 카드 (R3): `ProjectCard` 높이 72px 한 줄 — 끌기 손잡이 · 색 띠(`--c`) · 이름 + 종류 칩 + `현재 <단계> · 완료/전체` · `MiniTrack` · 작은 모닥불 + `마지막 작업` · `누적 N시간 M분` · `…`. 4일 이상 지난 카드는 글자 흐리게.
- `MiniTrack`: 단계 시작점마다 점(끝난 단계는 프로젝트 색), 지나온 길, 작은 캐릭터(`runnerPosition`), 끝 체크무늬 깃발.
- 순서 (R7): `ProjectList`에서 플랜 `useReorder`로 진행 중 카드 끌기 → `moveProject`(전체 배열 자리로 바꿔 넘김).
- 만들기 (R5, R9–R12): 점선 `+ 프로젝트 만들기` → `CreateProjectDialog` — 이름 · 색 7개 + `직접 고르기`(플랜 `ColorPicker`) · 종류 두 칸 + "만든 뒤에는 종류를 바꿀 수 없어요" · `StageListEditor`(손잡이·번호·이름·×, `+ 단계 추가`, 최소 1개) / `WeeklyEditor`(시작 주 월요일, 주 수 −/+, 주차별 기간·이름 칸). 이름이 비거나 단계가 0개면 `만들기` 막음.
- `…` 메뉴 (R8, R19): `CardMenu` — 이름·색 바꾸기(작은 팝업) / 단계 편집(5단계에서 연결, 지금은 숨김) / 구분선 / 빨간 프로젝트 삭제 → `ConfirmDialog` "'X'를 지울까요? 태스크 N개는 미분류로 옮겨집니다." → `deleteProject`.
- 완료 묶음 (R6): `DoneFold` `▸ 완료 N개`, 펼침 상태는 `projectsDoneOpen`. 펼치면 같은 카드를 흐리게, 캐릭터는 결승선. 0개면 숨김.
- 카드를 누르는 동작은 3단계에서 연결한다.

## 확인할 결과
- `npm run build` 성공.
- 단계형(기획·프로토·폴리싱)과 주차형(11/2 시작 4주, 2주차 이름 "중간")을 만들면 카드가 차례로 생기고 다시 켜도 남는다. 주차형 카드는 `현재 1주차`.
- 이름이 빈 채로는 만들 수 없고, 단계형에서 마지막 단계는 지울 수 없다.
- 카드를 끌어 순서를 바꾸면 다시 켜도 유지된다.
- `…` → 이름·색 바꾸기가 카드에 바로 반영. 삭제 확인 후 카드가 사라지고 그 태스크는 플랜 미분류에 보인다(태스크는 4단계부터 만들 수 있으니 이 확인은 4단계 뒤 다시 한다).
- 투데이에서 아직 시간 기록이 없으므로 모닥불은 장작만, `아직 없음`, `누적 0분`.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/projects/useProjectClock.ts`
- 새 `pages/projects/list/ProjectList.tsx`, `ProjectCard.tsx`, `MiniTrack.tsx`, `CardMenu.tsx`, `DoneFold.tsx`, `Projects.css`
- 새 `pages/projects/create/CreateProjectDialog.tsx`, `StageListEditor.tsx`, `WeeklyEditor.tsx`, `Create.css`
- 새 `pages/projects/common/Campfire.tsx`, `ProjectIcons.tsx`
- `pages/projects/ProjectsPage.tsx`·`.css`
