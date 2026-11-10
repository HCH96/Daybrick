# r1 · 시작·자동 시작·중복 실행 (req-startup: A6, A14–A17)

## A6 · 단일 실행
- 근거 요구사항: R19
- 수행 방법: src-tauri/src/lib.rs `run()`의 플러그인 등록
- 예상 결과: 두 번째 실행 콜백이 창 보이기 함수 호출
- 실제 결과: `tauri_plugin_single_instance::init` 콜백이 `background::show_main_window(app)`(R7과 같은 unminimize·show·focus) 호출. 다른 플러그인보다 먼저 등록
- 판정: 통과

## A14 · 숨긴 채 만들고 --autostart 없을 때만 보이기
- 근거 요구사항: R15, R16, D7
- 수행 방법: `grep -n visible src-tauri/tauri.conf.json`, background/mod.rs `setup`, autostart.rs `launched_by_autostart`·`AUTOSTART_ARG`, lib.rs 자동 시작 플러그인 인자
- 예상 결과: visible:false, --autostart 없을 때만 보여 줌
- 실제 결과: tauri.conf.json `"visible": false`. `setup`에서 `!launched_by_autostart()`일 때만 `show_main_window`. 인자 검사는 `std::env::args()`에서 `--autostart`와 같은지 보고, 플러그인도 같은 상수로 `--autostart`를 붙여 등록
- 판정: 통과

## A15 · 첫 실행 자동 등록
- 근거 요구사항: R14, D5
- 수행 방법: autostart.rs `init_on_first_run`, app_settings.rs 필드
- 예상 결과: 성공 시에만 autostartInitialized=true, 한 번 true면 다시 켜지 않음
- 실제 결과: `autostart_initialized`가 true면 바로 return. `enable()` 실패면 로그만 남기고 return(적지 않음 → 다음 실행 때 재시도). 성공했을 때만 true로 적어 저장
- 판정: 통과

## A16 · 스위치 변경 실패 처리
- 근거 요구사항: R17 (코드 확인으로 대신)
- 수행 방법: pages/settings/AppSection.tsx `onToggle`, autostart.rs `set_autostart`
- 예상 결과: 원래 값으로 되돌리고 "자동 시작 설정을 바꾸지 못했어요" 표시
- 실제 결과: 화면을 먼저 바꾼 뒤 `setAutostart` 실패 시 `enabled: !next`(원래 값)로 되돌리고 `failed=true` → `role="alert"`로 문구 그대로 표시. Rust는 바꾼 뒤 다시 읽어 값이 다르면 오류를 돌려 실패로 처리
- 판정: 통과

## A17 · 개발 모드에서는 건너뜀
- 근거 요구사항: R18, D6
- 수행 방법: autostart.rs `is_available`, `init_on_first_run`, `set_autostart`, `autostart_status`, AppSection.tsx 스위치
- 예상 결과: debug_assertions에서 등록·해제 건너뜀, 스위치 비활성 + "개발 모드에서는 바꿀 수 없어요"
- 실제 결과: `is_available() = !cfg!(debug_assertions)`. 첫 실행 등록·`set_autostart` 모두 이 값이 false면 건너뜀(오류 반환). 상태에 `available`을 실어 보내고, 화면은 `!available`이면 스위치 `disabled` + 문구 그대로 표시
- 판정: 통과
