# 안드로이드 앱 문서 목록
**먼저 읽기**: apps/android/CLAUDE.md (안드로이드 규칙). 서버를 쓰는 기능이면 supabase/CLAUDE.md (모든 앱 공용 서버 규칙)도 읽는다.
안드로이드 보조 앱(Kotlin, 접근성 서비스로 앱 차단, apps/android)의 색인. 구조는 PC 앱 색인(../desktop/index.md)과 같다.
읽는 순서: 이 목록 → 기능 허브 → 하위 색인(spec·plan·logs·mockups) → 필요한 파일. 이어서 작업할 때는 기능의 notes.md부터.
기능 허브나 안드로이드 공용 문서를 새로 만들거나 없앨 때만 이 목록을 고친다.

## 기능 허브 (docs/android/features/<기능명>/index.md)
(아직 없음)

## 안드로이드 공용 문서 (docs/android/common)
- [common/ai/setup/android-setup.md](common/ai/setup/android-setup.md): 개발 환경 설치(Android Studio·SDK·가상 폰)와 프로젝트 생성 기록, 주의점
- [common/ai/testing.md](common/ai/testing.md): 테스트 방식, 가상 폰 + adb로 하는 AI 화면 확인 명령
- 릴리즈 절차·모바일 디자인 기준은 첫 기능을 만들 때 만든다.

## 다른 앱과 주고받는 것
PC 앱·웹과 주고받는 약속(Supabase 테이블, 실시간 메시지 형식, 상태 값)은 여기가 아니라 docs/common/ai/contracts/에 둔다. 해당 기능 명세서를 쓸 때 만든다.
