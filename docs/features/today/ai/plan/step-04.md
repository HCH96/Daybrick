# 투데이 4단계: 종료·강제 종료 복구, 태스크 감시

- 요구사항: R24, R25 (+ D10 감시 규칙)
- 목업: 없음 (화면 변화 없음)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3, D8, D9, D10

## 할 일
- 1분 확인 (R25): `useHeartbeat` — running이 있으면 1분마다 `touch(now)`로 `lastSeenAt` 갱신(자동 저장이 파일에 씀). 일시정지 중에도 갱신해도 되지만 열린 구간이 없으므로 기록에는 영향 없음.
- 창 닫기 (R24, D9): `onCloseRequested`에서 `lastSeenAt`을 지금으로 적고 바로 저장(`useAutoSave`의 닫기 저장 흐름). 기록 옮기기·태스크 상태 바꾸기는 여기서 하지 않는다. 앱 종료 처리는 이 한 곳에 둔다(나중 백그라운드 상주 때 이 지점만 옮김, extension.md).
- 시작 때 복구 (R24, R25, D9): 오늘 데이터와 플랜 데이터가 둘 다 ready가 되면 한 번 — running이 있으면
  - 열린 구간을 `lastSeenAt`에서 닫고(`lastSeenAt` < 구간 시작이면 0초 → 버림) `finish`,
  - 그 태스크가 아직 있고 완료가 아니면 `updateTask(status "todo")`.
- 태스크 감시 (D10): `useTimerGuard` — running 태스크를 플랜 데이터에서 지켜본다.
  - 상태가 `done`이 되면 `finish`만(완료는 이미 됨), `todo`가 되면 `finish`만, 태스크가 없어지면 `finish`.
  - 자기가 바꾼 상태(타이머 완료·중단)로 두 번 처리하지 않게 `finish` 뒤에는 running이 없으므로 그냥 넘어간다.
- 플랜 저장이 ready가 아니면(읽기 실패) 복구는 기록만 하고 상태 바꾸기는 건너뛴다.

## 확인할 결과
- `npm run build`, `cargo check` 성공.
- `npm run tauri dev`에서 타이머를 3분 돌리고 창을 닫았다 다시 열면: records에 약 3분 구간이 남고, 태스크는 시작 전 열에, 타이머는 빈 상태.
- 타이머를 돌린 채 작업 관리자로 강제 종료 → 다시 열면 마지막 1분 단위 시각까지 기록되고 시작 전으로 돌아온다.
- 일시정지 상태로 창을 닫으면 쉰 시간은 기록되지 않는다.
- 실행 중 태스크를 칸반 카드 → 상세 팝업에서 완료로 바꾸면 타이머가 끝나고 기록이 남는다. 시작 전으로 바꾸면 중단과 같다. 휴지통으로 지우면 타이머가 꺼지고 그때까지 기록이 남는다.
- Node로 복구 함수 실행: 구간 시작 10:00, lastSeenAt 10:07 → 7분 기록, running 비움.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/today/useHeartbeat.ts`, `useTimerGuard.ts`
- `features/today/reducer.ts`, `store.tsx`, `useAutoSave.ts`
