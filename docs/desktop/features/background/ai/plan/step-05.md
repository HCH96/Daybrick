# 백그라운드 실행 5단계: 설치본 확인

- 요구사항: R3, 전체 (done.md)
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- `npm run tauri build`로 설치 파일을 만들고 설치한다.
- 창을 숨긴 채 7분 넘게 두고 `today.json`의 `running.lastSeenAt`이 1분마다 바뀌는지 본다 (WebView2는 숨은 창의 타이머를 느리게 돌릴 수 있다).
  - 갱신이 멈추거나 크게 늦으면 `tauri.conf.json` 창 설정에 `additionalBrowserArgs`를 넣는다. Tauri 기본값(`--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection`)에 `--disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows`를 더한다. 넣었으면 결정으로 올린다.
- 설치본에서 R1–R19를 한 번씩 돌려 본다. 자동 시작 실패(R17)는 Run 키 쓰기를 막기 어려우므로 코드 확인으로 대신하고 그렇게 적는다.

## 확인할 결과
- `npm run tauri build` 성공. `src-tauri/target/release/bundle/`에 설치 파일, `target/release/daybrick.exe`가 있다.
- 설치 후 첫 실행: Run 키에 Daybrick(`--autostart` 인자 포함)이 생기고, `app-settings.json`에 `"autostartInitialized": true`.
- 설정 › 앱 스위치가 켜져 있다. 끄면 Run 키가 없어지고, 켜면 다시 생긴다. 앱을 다시 켜도 끈 상태가 유지된다 (첫 실행 등록이 다시 돌지 않음).
- 로그아웃 후 다시 로그인하면 창 없이 트레이 아이콘만 생긴다.
- 숨김 상태에서도 lastSeenAt이 1분마다 갱신된다 (R3).
- 시작 메뉴로 한 번 더 실행하면 떠 있는 앱의 창이 열린다 (R19).

## 이 단계에서 만들거나 고칠 파일
- (필요할 때만) `src-tauri/tauri.conf.json`
