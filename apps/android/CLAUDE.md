# 안드로이드 앱 규칙 (apps/android)
안드로이드 앱 코드를 다루거나 안드로이드 기능을 명세·계획할 때 따른다. 문서 색인은 docs/android/index.md.
서버를 쓰는 기능이면 supabase/CLAUDE.md(모든 앱 공용 서버 규칙)를 먼저 읽는다. PC 앱과 주고받는 약속은 docs/common/ai/contracts/에 둔다.

## 기술 스택
- Kotlin. 접근성 서비스로 지정한 앱(유튜브 등)을 차단하는 보조 앱이다.
- 빌드 도구·최소 안드로이드 버전·화면 방식은 개발 환경을 정할 때 여기에 적는다.

## 코드 규칙
- 개발 환경을 정할 때 정한다.

## 안드로이드 전용 제약
- 개발하면서 정해지는 대로 적는다. 서버 연결·로그인·키 규칙은 supabase/CLAUDE.md를 따른다 (예: PAT·Anthropic 키는 저장하지 않는다).

## 명령어 (apps/android에서 실행)
- 개발 환경을 정한 뒤 추가한다. 설치·빌드 절차 문서는 docs/android/common/에 둔다.
