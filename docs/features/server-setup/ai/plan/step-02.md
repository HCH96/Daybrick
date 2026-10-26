# 서버 연결 2단계: 첫 실행 안내와 마법사 틀

- 요구사항: R1–R3, R7, R9, R10 (R46 버튼 연결)
- 목업: welcome.html (welcome-actions, welcome-needs), wizard-prepare.html (wiz-prep-steps, -cards, -guide, -foot)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- `App.tsx`: 연결 정보가 없고 `welcomeDismissed`가 false면 사이드바 없이 제목 표시줄 + `WelcomeScreen`. 마법사가 열려 있으면 `WizardShell`.
- `WelcomeScreen`: 앱 소개 한 줄, [서버 연결 시작], [나중에 하기](→ `welcomeDismissed: true` 저장, 다시 안 뜸).
- `useWizard`: 지금 단계, 입력값(메모리만), 이동(`next`/`prev`/`cancel`). 취소하면 입력값을 모두 버리고 원래 화면으로 (R3).
- `WizardShell`: 위 진행 표시 4단계(`WizardProgress`), 왼쪽 단계 화면, 오른쪽 460px `WizardGuide`, 아래 `WizardFooter`([취소] 왼쪽, [이전]·[다음] 오른쪽).
- `guides.ts`: 단계별 가이드 번호 목록과 외부 링크, 주의 상자(R10은 ① 준비에). 링크는 `@tauri-apps/plugin-opener`의 `openUrl`로 기본 브라우저 (R9). ✓ 자동 체크는 하지 않는다.
- `PrepareStep`: 준비물 카드(Supabase, Anthropic, Google Cloud).
- 설정의 [서버 연결 시작](R46)이 마법사를 연다.

## 확인할 결과
- `server.json`이 없는 상태로 켜면 첫 실행 안내가 전체 화면으로 뜬다. [나중에 하기] → 평소 화면, 앱을 다시 켜도 안 뜬다.
- [서버 연결 시작] → ① 준비. 진행 표시 1번 보라, 나머지 회색. 가이드 링크를 누르면 기본 브라우저가 열린다.
- [취소] → 원래 화면. 설정 → [서버 연결 시작]으로도 같은 마법사가 열린다.
- 창 폭 960px에서 가이드와 입력이 겹치지 않는다.
- `npm run build` 성공.

## 이 단계에서 만들거나 고칠 파일
- `pages/server-setup/WelcomeScreen.tsx`(+css)
- `pages/server-setup/wizard/WizardShell.tsx`(+css), `WizardProgress.tsx`, `WizardGuide.tsx`, `WizardFooter.tsx`, `guides.ts`, `useWizard.ts`, `PrepareStep.tsx`
- `App.tsx`, `pages/settings/ServerSectionOff.tsx`, `features/server/ServerProvider.tsx`
