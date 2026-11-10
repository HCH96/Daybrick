# 자동 업데이트 4단계: 설정 업데이트 줄·알림 이동

- 요구사항: R8, R10–R13, R15, R20 (진행률 표시), R22, R23 (문구)
- 목업: 없음 (req-settings.md "화면 구성" 그림, 모양은 지금 `AppSection`의 `app-section__row`·`settings-card`, 값은 design-direction.md)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3

## 할 일
- 새 `pages/settings/UpdateRow.tsx`, `.css` (`useUpdater()` 사용):
  - 왼쪽 "업데이트" + "현재 버전 {v}", 오른쪽 [업데이트 확인] (R10, R11). 확인 중이면 "확인 중…" + 비활성.
  - 버튼 아래 결과 문구: 최신 "최신 버전이에요", 확인 실패 "업데이트를 확인하지 못했어요. 인터넷 연결을 확인해 주세요." (R12)
  - 새 버전: "새 버전 {v}", notes가 있으면 변경 내용(줄바꿈 유지), 없으면 생략, [설치하고 다시 시작] (R13).
  - 받는 중: "받는 중 42%" + 진행 막대(퍼센트를 모르면 막대 없이 "받는 중…"), 두 버튼 비활성 (R20).
  - 받기 실패 "업데이트를 받지 못했어요. 다시 시도해 주세요.", 서명 실패 "업데이트 파일을 확인하지 못해 설치하지 않았어요." (R22, R23). 버튼은 다시 누를 수 있다.
  - 개발 모드: 두 버튼 비활성 + "개발 모드에서는 업데이트할 수 없어요" (R15, 자동 시작 줄의 `app-section__note` 모양).
  - [설치하고 다시 시작]은 이 단계에서는 Provider의 빈 함수에 연결만 한다 (5단계에서 채움).
- `AppSection.tsx`: 자동 시작 줄 아래 구분선 + `<UpdateRow />`.
- `SettingsPage.tsx`: `usePageIntent("settings", (i) => { if (i.tab) scrollTo(i.tab); })` (R8).
- 새 `features/updater/devUpdater.ts`: 개발 모드에서만 `window.daybrickUpdater("available" | "downloading" | …)`로 Provider 상태를 바꾼다. `main.tsx`나 Provider에서 설치.

## 확인할 결과
- `npm run build` 성공.
- 개발 모드 설정 › 앱: "현재 버전 0.1.0", 두 버튼 비활성, "개발 모드에서는 업데이트할 수 없어요" (R10, R15).
- 콘솔 `daybrickUpdater(...)`로 바꿔 보면 차례로 보인다: 확인 중 버튼, 최신 문구, 확인 실패 문구, 새 버전 + 변경 내용 + 설치 버튼(notes 없으면 변경 내용 줄 없음), 받는 중 42% 막대, 받기 실패 문구, 서명 실패 문구.
- 콘솔 `daybrickNotify({ source:"updater", kind:"update-available", importance:"info", title:"새 버전 0.2.1이 나왔어요", body:"설정에서 설치할 수 있어요", target:{page:"settings", tab:"app"}, mergeKey:"update-available" })` → 알림을 누르면 설정 "앱" 칸으로 스크롤된다 (R8). 다른 페이지에 있을 때도 같다.
- 좁은 창(960px)에서 줄이 넘치지 않는다.

## 이 단계에서 만들거나 고칠 파일
- 새 `src/pages/settings/UpdateRow.tsx`, `UpdateRow.css`
- `src/pages/settings/AppSection.tsx`, `src/pages/settings/SettingsPage.tsx`
- 새 `src/features/updater/devUpdater.ts`, `src/features/updater/UpdaterProvider.tsx` (흉내 연결)
