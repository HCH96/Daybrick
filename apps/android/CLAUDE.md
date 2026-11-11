# 안드로이드 앱 규칙 (apps/android)
안드로이드 앱 코드를 다루거나 안드로이드 기능을 명세·계획할 때 따른다. 문서 색인은 docs/android/index.md.
서버를 쓰는 기능이면 supabase/CLAUDE.md(모든 앱 공용 서버 규칙)를 먼저 읽는다. PC 앱과 주고받는 약속은 docs/common/ai/contracts/에 둔다.

## 기술 스택 (2026-11-11 결정, 기록: docs/common/ai/logs L12)
- Kotlin. 접근성 서비스로 지정한 앱(유튜브 등)을 차단하는 보조 앱이다.
- 빌드: Gradle(Kotlin DSL `*.gradle.kts`, 버전은 `gradle/libs.versions.toml`에 모음). 모듈은 `app` 하나.
- 화면: Jetpack Compose + Material 3. 예전 XML 화면 방식은 쓰지 않는다.
- 최소 버전 Android 8.0(API 26), 목표·컴파일 버전은 최신(지금 37). 패키지 이름 `com.daybrick.android`.
- 배포: Play 스토어에 올리지 않고 APK를 직접 설치한다 (접근성 서비스 앱은 Play 심사가 까다롭다).
- 설정 저장은 DataStore, 비동기는 코루틴·Flow. 서버 연결 도구(supabase-kt 유력)는 집중 모드 명세 때 정한다.

## 코드 규칙
- 소스는 `app/src/main/java/com/daybrick/android/` 아래 기능별 폴더로 나눈다 (PC 앱의 features와 같다). 파일과 화면 함수(Composable)는 작게 나눈다.
- 큰 프레임워크(Hilt 등)·모듈 나누기는 필요해질 때 사용자에게 물은 뒤 더한다.
- AI 화면 확인용으로 누르거나 읽을 요소에는 `Modifier.testTag("이름")`을 단다. 최상위 화면에 `testTagsAsResourceId = true`를 켜 두어 adb 화면 구조에서 그 이름으로 찾는다.
- 순수 로직(화면·안드로이드 기능 없는 계산)은 `app/src/test/`에 JUnit 테스트를 같이 쓴다.

## 안드로이드 전용 제약
- 개발하면서 정해지는 대로 적는다. 서버 연결·로그인·키 규칙은 supabase/CLAUDE.md를 따른다 (예: PAT·Anthropic 키는 저장하지 않는다).
- `local.properties`(이 PC의 SDK 경로)는 커밋하지 않는다 (.gitignore에 있음).

## 명령어 (apps/android에서 실행)
- Git Bash에서는 먼저 `export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"` (Android Studio에 든 JDK). adb는 PATH에 없어서 `"$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"`로 부른다.
- 빌드 (디버그 APK): `./gradlew assembleDebug`
- 가상 폰에 설치: `./gradlew installDebug` (가상 폰이 켜져 있어야 한다)
- 단위 테스트 (JUnit): `./gradlew test`
- 가상 폰 켜기·화면 읽기·누르기 등 AI 화면 확인 방법: docs/android/common/ai/testing.md
- 설치·프로젝트 생성 기록: docs/android/common/ai/setup/android-setup.md
