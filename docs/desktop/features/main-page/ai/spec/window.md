# 메인 페이지: 창 설정
- 기본 창 크기 1200x800, 최소 960x640, 화면 가운데에 띄운다 (R2).
- 2026-10-22: Windows 기본 제목 표시줄을 끄고(`decorations: false`) 앱이 직접 그린다 (R3).
  창 버튼·끌기에 필요한 권한은 `src-tauri/capabilities/default.json`에 둔다.
- 알려진 제약: Windows 11의 최대화 버튼 위 스냅 레이아웃 메뉴는 나오지 않는다.
- PowerShell에서는 실행 정책 때문에 `npm` 대신 `npm.cmd`로 실행한다 (예: `npm.cmd run tauri dev`).
