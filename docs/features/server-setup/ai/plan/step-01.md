# 서버 연결 1단계: 설정 화면 틀과 연결 정보 저장

- 요구사항: R45, R46 (버튼 동작은 2단계에서 연결)
- 목업: settings.html (settings-nav, settings-off)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- Rust `server/config.rs`: `load_server_config`(없으면 None), `save_server_config`(임시 파일 바꿔치기), `clear_server_connection`. JSON은 해석하지 않고 문자열로 주고받는다 (storage.rs와 같은 방식).
- `features/server/types.ts`·`config.ts`: `ServerConfig` 읽기·쓰기, 파일이 없거나 깨졌으면 기본값(연결 없음, welcomeDismissed false).
- `ServerProvider`·`useServer`: 연결 정보와 상태(지금은 `off`/`connected`만)를 공유. `App.tsx`에서 감싼다.
- `PageId`에 `settings` 추가, 사이드바 맨 아래(버전 표시 위)에 Settings 메뉴. `pages.ts`에 `position: "bottom"` 같은 표시를 두고 `Sidebar`가 나눠 그린다. 아이콘은 목업 icons.js의 settings 모양.
- `SettingsPage`: 칸 단위 목록(이후 기능이 칸을 추가, D6). 이번엔 `ServerSection` 하나.
- `ServerSectionOff`: 설명, 서버로 쓸 수 있는 기능 목록, [서버 연결 시작] (지금은 눌러도 아무것도 안 함).

## 확인할 결과
- 사이드바 맨 아래에 Settings가 보이고, 누르면 설정 화면에 "서버 연결" 칸이 "연결 안 함" 상태로 보인다 (목업과 같은 배치).
- 뒤로·앞으로, 사이드바 접기가 Settings에서도 동작한다.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/src/server/mod.rs`, `server/config.rs`, `src-tauri/src/lib.rs`
- `features/server/types.ts`, `config.ts`, `ServerProvider.tsx`, `useServer.ts`
- `pages/settings/SettingsPage.tsx`(+css), `ServerSection.tsx`, `ServerSectionOff.tsx`
- `app/types.ts`, `app/pageLabels.ts`, `app/pages.ts`, `components/layout/Sidebar.tsx`(+css), `components/icons/NavIcons.tsx`, `App.tsx`
