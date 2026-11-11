# 안드로이드 앱 테스트 방식
PC 앱 방식(docs/desktop/common/ai/testing.md)과 같은 세 주체(AI 코드·AI 화면·출시 확인)를 쓴다. 다른 점은 화면 확인을 브라우저 대신 **가상 폰 + adb**로 한다는 것.

## AI 코드
- `./gradlew test`(JUnit 단위 테스트)와 `./gradlew assembleDebug`(빌드). 명령은 apps/android/CLAUDE.md.

## AI 화면 (가상 폰 + adb)
2026-11-11 시험 화면으로 아래 명령이 모두 동작하는 것을 확인했다 (기록: docs/common/ai/logs L12).
`ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"`로 두고 쓴다.

| 하는 일 | 명령 |
|---|---|
| 가상 폰 켜기 (백그라운드로) | `"$LOCALAPPDATA/Android/Sdk/emulator/emulator.exe" -avd Medium_Phone_API_37.0 -no-snapshot-save -no-boot-anim` |
| 켜질 때까지 기다리기 | `"$ADB" wait-for-device shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'` |
| 앱 설치 | `./gradlew installDebug` |
| 앱 열기 (다시 시작) | `"$ADB" shell am start -W -S -n com.daybrick.android/.MainActivity` |
| 화면 구조 읽기 | `"$ADB" exec-out uiautomator dump /dev/tty` |
| 스크린샷 | `"$ADB" exec-out screencap -p > <임시 폴더>/shot.png` 후 Read로 본다 |
| 누르기·입력·뒤로 | `"$ADB" shell input tap X Y` / `input text '...'` / `input keyevent BACK` |
| 앱이 꺼진 기록 | `"$ADB" logcat -d -b crash` |

- **화면 구조 읽기를 먼저 쓴다.** 결과는 XML이고, 요소마다 `text`·`resource-id`(= Compose의 testTag)·`clickable`·`bounds="[x1,y1][x2,y2]"`가 있다. 누를 좌표는 bounds의 가운데로 잡는다. 빈 요소가 많으니 `text`나 `resource-id`가 있는 줄만 골라 읽는다.
- 스크린샷은 모양·색을 봐야 할 때만 찍는다. 1080×2400이라 토큰이 크다.
- 이름표가 화면 구조에 보이려면 코드 규칙대로 testTag와 `testTagsAsResourceId`가 있어야 한다.

## 아직 정하지 않은 것 (첫 안드로이드 기능의 /test 전에 정한다)
- `test-android` 하위 에이전트 (test-ui를 본떠 만든다)와 /test 연결.
- 예시 데이터: 디버그 빌드에서 PC의 `?fixture=`처럼 예시 데이터로 시작하는 방법 (예: `am start`에 값 넘기기).
- 접근성 서비스 켜기: 에뮬레이터에서는 `adb shell settings put secure enabled_accessibility_services ...`로 켤 수 있을 것으로 본다 (아직 시험 안 함).
- 출시 확인: 제조사 배터리 절약(삼성 등)에 의한 차단 중단 같은 실제 폰 전용 항목. 실제 폰도 USB·무선 디버깅을 켜면 같은 adb 명령을 쓸 수 있다.
