# 투데이 1단계: 메뉴·저장소 틀

- 요구사항: R1, R3, R4
- 목업: `today.html` 전체 배치만 (머리·today-week 자리·칸반 60 : 오른쪽 40). CSS는 today.css·common.css에서 클래스 검색
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1, D8, D11

## 할 일
- 메뉴 (R1, D1, D11):
  - `app/types.ts`의 PageId `timer`를 `today`로 바꾸고, `pageLabels.ts`에 "투데이"/`Today`. 쓰는 곳은 grep으로 찾는다.
  - `NavIcons.tsx`의 `TimerIcon`을 `TodayIcon`으로 (목업 icons.js의 사이드바 아이콘 모양).
  - `pages.ts`의 placeholder를 `TodayPage`로. `dashboardCards.tsx`의 `linkTo`·`EmptyState linkTo` 세 곳을 `"today"`로 (글자는 그대로).
- 저장소 (D8):
  - Rust `today.rs`: `load_today`(없으면 None), `save_today`(임시 파일 후 바꿔치기). `lib.rs`에 등록.
  - `features/today/types.ts`·`storage.ts`·`useAutoSave.ts`·`reducer.ts`·`store.tsx`: 플랜 것과 같은 흐름 (loading → ready / failed, 실패하면 저장 안 함). 이 단계 reducer는 `loaded`·`load-failed`만. 빈 데이터의 목표는 360.
  - `App.tsx`: `PlanProvider` 안쪽에 `TodayProvider`.
- 날짜 (R4): `useTodayKey()` — `toDateKey(new Date())`를 돌려주고, 다음 자정까지 `setTimeout`, 창 포커스(`focus`·`visibilitychange`) 때 다시 계산.
- 화면 (R3):
  - `TodayPage`: 머리 "투데이" + 오늘 날짜(`formatKoreanDate`), 위 한 줄 자리, 아래 그리드 왼쪽 약 60% · 오른쪽 약 40%(위 타이머 자리 250px, 아래 요약 자리, 간격 18).
  - 읽기 실패면 본문 자리에 오류 문구 (플랜 화면의 실패 표시와 같은 방식).

## 확인할 결과
- `npm run build`, `cargo check` 성공.
- 사이드바 Timer 자리에 `Today`, 누르면 제목 "투데이"와 오늘 날짜, 위 한 줄과 60:40 두 칸이 빈 틀로 보인다.
- 홈 "오늘 집중 시간"·"이번 주 집중" 카드 이동 버튼이 투데이로 간다.
- 처음 읽은 데이터는 저장하지 않으므로 이 단계에서는 `today.json`이 아직 없어도 정상이다(파일이 없으면 빈 데이터로 시작). 첫 기록이 생기는 3단계부터 `{"version":1,"records":[…],"running":…,"settings":{"dailyGoalMinutes":360}}` 모양으로 생긴다.
- Node로 `useTodayKey`의 자정까지 남은 시간 계산 함수 실행: 23:59:30 → 30초.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src-tauri/src/today.rs`(새), `lib.rs`
- `apps/desktop/src/app/types.ts`, `pageLabels.ts`, `pages.ts`, `App.tsx`, `components/icons/NavIcons.tsx`, `pages/home/dashboardCards.tsx`
- 새 `features/today/types.ts`, `storage.ts`, `useAutoSave.ts`, `reducer.ts`, `store.tsx`, `useTodayKey.ts`
- 새 `pages/today/TodayPage.tsx`·`TodayPage.css`
