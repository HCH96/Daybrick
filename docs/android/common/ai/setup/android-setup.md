# 안드로이드 개발 환경 설치와 프로젝트 생성
2026-11-11 설치. 기술 스택 결정은 apps/android/CLAUDE.md.

## 설치된 것
| 항목 | 위치·버전 |
|---|---|
| Android Studio | `C:\Program Files\Android\Android Studio` (빌드 AI-262, "Rabbit 2") |
| JDK | Android Studio 안의 `jbr` 폴더. gradlew가 쓰도록 JAVA_HOME을 여기로 둔다 |
| Android SDK | `%LOCALAPPDATA%\Android\Sdk` (platforms android-37.0, platform-tools, emulator) |
| 가상 폰 | `Medium_Phone_API_37.0` (Google Play 포함 이미지, 1080×2400, Android 17) |
| 가속 | WHPX(Windows 하이퍼바이저 플랫폼) 사용 가능 |

- cmdline-tools(sdkmanager·avdmanager)는 설치하지 않았다. SDK 구성 요소나 가상 폰을 더할 때는 Android Studio의 SDK Manager·Device Manager를 쓴다.

## 프로젝트 생성 (사용자가 Android Studio에서)
- 첫 실행 설정: Standard, 라이선스 동의 (약관이라 사용자가 직접).
- New Project → **Empty Activity**(Compose). Name `Daybrick`, Package `com.daybrick.android`, 위치 `apps/android`, Minimum SDK API 26, Kotlin DSL.
- "Add Files to Git" 창은 Cancel + Don't ask again. 커밋은 비밀값·경로를 확인한 뒤 Claude가 한다.
- 만들어진 버전: Gradle 9.6.0, Android Gradle Plugin 9.5.1, Kotlin 2.2.10, Compose BOM 2026.02.01.

## 주의점
- 템플릿 목록에서 No Activity(빈 껍데기)·Empty Views Activity(예전 XML 방식)를 고르지 않는다.
- 처음 빌드는 Gradle이 필요한 파일을 받느라 몇 분 걸린다. 이후 빌드는 30초 안쪽.
- `apps/android/.gitkeep`은 프로젝트 생성 전부터 있던 빈 파일이다.
