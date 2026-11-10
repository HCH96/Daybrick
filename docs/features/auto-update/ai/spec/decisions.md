# 자동 업데이트 결정 사항

- D1. updater 플러그인은 Rust에서만 쓰고, 프론트는 우리 명령(`updater_info`·`check_update`·`download_update`·`install_update`·`discard_update`)만 부른다. 오류를 종류(network·signature)로 나누고, 개발 모드 판단을 `cfg!(debug_assertions)` 한 곳에서 하기 위해서다. 플러그인 JS 권한은 열지 않는다. (적용: 1단계 이후 전체) (기록: L02)
- D2. 받기와 설치를 나눈다. 받은 파일은 메모리에만 두고 [나중에 설치]·서명 실패·앱 종료 때 버린다. 설치 직전에 타이머를 다시 보고 `runQuitHandlers` 뒤 설치한다. (적용: 2단계 이후 전체) (기록: L02)
- D3. 업데이트 알림은 보낸 기능 `updater`(알림에 "Daybrick"으로 보임), 합치기 키 새 버전 `update-available`·실패 `update-failed`, 갈 곳 `{page:"settings", tab:"app"}`. (적용: 3단계 이후 전체) (기록: L02)
- D4. 자동 확인은 화면이 뜨고 5초 뒤 한 번, 그 뒤 1시간마다 "마지막 확인 뒤 24시간이 지났나"만 본다. 절전에서 깨어나도 확인이 밀리지 않게 하기 위해서다. (적용: 3단계 이후 전체) (기록: L02)
- D5. `app-settings.json`이 있는데 읽거나 해석하지 못하면 "알린 버전"을 쓰지 않고 건너뛴다 (R36). (적용: 2단계 이후 전체) (기록: L02)
- D6. Rust가 받은 바이트를 버리는 때를 넓힌다: `check_update`가 다른 버전을 찾거나 새 버전이 없을 때, `install_update`가 실패했을 때도 버린다 (다시 받게 함). 개발 모드의 `check_update` 오류는 kind `network`로 준다. (적용: 2단계 이후 전체) (기록: L04)
- D7. 설치 흐름은 `api.ts`의 `UpdateBackend`(받기·설치·버리기)를 통해 부르고, 개발 모드에서는 `devUpdater.ts`가 흉내로 바꿔 끼운다. 흉내는 콘솔 `daybrickUpdater("install")`로 시작하고 `("done" | "fail" | "badSignature")`로 끝내며, 설치 명령은 부르지 않는다 (종료 전 저장은 돈다). 확인 창의 [나중에 설치] 글자는 `ConfirmDialog`의 새 `cancelLabel`로 바꾼다. (적용: 5단계 이후 전체) (기록: L07)
