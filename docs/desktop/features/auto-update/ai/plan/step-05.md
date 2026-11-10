# 자동 업데이트 5단계: 설치 흐름·실패 처리

- 요구사항: R16–R24
- 목업: 없음 (확인 창은 BackgroundDialogs의 ConfirmDialog 모양)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D3, background D3·D4, today D9

## 할 일
- `UpdaterProvider.tsx`에 설치 흐름:
  - `startInstall()`: 타이머가 없으면 바로 받기 (R16). 있으면 확인 창 상태 `timer-confirm` (R17).
  - [기록 저장하고 설치] → 이번 흐름에서 동의한 것으로 적고 받기 (R18).
  - [나중에 설치] → 창만 닫고, 받은 바이트가 있으면 `discardUpdate`. 상태는 `available`로 (R19, D2).
  - 받기: `downloading{percent}` → 성공하면 설치 직전 확인: 타이머가 돌고 있고 이번 흐름에서 동의하지 않았으면 확인 창 한 번 더 (R20). 아니면 `installing` → `runQuitHandlers()` → `installUpdate()` (R21).
  - 받기 실패(network) → `downloadFailed` + 실패 알림, 서명 실패 → `signatureFailed` + 실패 알림 (R22, R23).
  - 설치 명령 자체가 실패하면 받기 실패와 같이 처리한다.
- `notices.ts`: `failureNotice(kind)` → source `updater`, kind `update-failed`, 주의, 제목은 설정 문구와 같게, target `{page:"settings", tab:"app"}`, mergeKey `update-failed` (R24, D3).
- 새 `components/updater/UpdateDialogs.tsx`: `timer-confirm`일 때 ConfirmDialog (제목 "업데이트 설치", 본문 "타이머가 실행 중이에요. 기록을 저장하고 설치할까요?", [나중에 설치]/[기록 저장하고 설치]). Esc = [나중에 설치].
- `TitleBar.tsx`: `BackgroundDialogs` 옆에 `UpdateDialogs` (어느 페이지에서든 받는 도중 확인 창이 보이게).
- `UpdateRow.tsx`: [설치하고 다시 시작]을 `startInstall`에 연결.
- `devUpdater.ts`: 받기 성공·실패·서명 실패를 흉내 낼 수 있게 (설치 명령은 부르지 않음).

## 확인할 결과
- `npm run build`, `cargo check` 성공.
- 개발 모드 흉내 (`daybrickUpdater`):
  - 타이머 없이 [설치하고 다시 시작] → 확인 창 없이 받는 중으로 바뀐다.
  - 투데이 타이머를 켜고 누르면 확인 창이 뜬다. [나중에 설치] → 창이 닫히고 새 버전 정보·버튼이 그대로다.
  - 타이머 없이 받는 중 흉내 → 그 사이 타이머 시작 → 받기 끝 흉내 → 확인 창이 한 번 더 뜬다 (R20).
  - 받기 실패 → 설정 문구 + 주의 알림. 서명 실패도 같다. 두 번 반복해도 안 읽은 실패 알림은 하나다 (R24).
  - 다른 페이지에 있을 때 확인 창이 그 페이지 위에 뜬다.
- 실제 받기·저장·설치·재시작은 6단계 설치본에서 확인한다.

## 이 단계에서 만들거나 고칠 파일
- `src/features/updater/UpdaterProvider.tsx`, `notices.ts`, `devUpdater.ts`
- 새 `src/components/updater/UpdateDialogs.tsx`
- `src/components/layout/TitleBar.tsx`, `src/pages/settings/UpdateRow.tsx`
