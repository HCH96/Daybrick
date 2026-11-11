# PC 앱 규칙 (apps/desktop)
PC 앱 코드를 다루거나 PC 앱 기능을 명세·계획할 때 따른다. 문서 색인은 docs/desktop/index.md.
서버를 쓰는 기능이면 supabase/CLAUDE.md(모든 앱 공용 서버 규칙)를 먼저 읽는다.

## 기술 스택
- Tauri 2 + React + TypeScript. 화면은 `src/`(pages·features·components·styles), 네이티브 쪽은 `src-tauri/`(Rust).
- 데이터는 로컬 JSON 파일에 저장하고, 서버 연결 시 기능별 한 행으로 동기화한다.

## 코드 규칙
- TypeScript strict 모드, any 사용 지양.
- 컴포넌트와 파일은 작게 나눈다.
- 색·글씨·간격 값은 `src/styles/theme.css` 토큰만 쓴다. 디자인 기준은 docs/desktop/common/ai/design/design-direction.md.

## PC 앱 전용 제약
- 로그인 토큰은 Windows 자격 증명 관리자에 refresh 토큰만 저장하고, 앱을 켤 때 그 토큰으로 세션을 다시 받는다. 주소·anon 키는 앱 설정 파일에 둔다. (server-setup D4, D14)
- Google 로그인 결과는 PKCE와 `http://127.0.0.1:<임시 포트>/auth/callback`에서 한 번만 받는 Rust 수신기로 받는다. (server-setup D13)
- Supabase 관리 API·Anthropic 키 사전 확인은 Rust에서 하고, PAT·키는 호출마다 인자로만 넘긴다. (server-setup D11)
- 서버 구조 적용과 서버 함수 배포는 이 앱이 맡는다. SQL과 서버 함수는 Rust가 빌드 때 포함하고, 최신 번호 기준은 `src-tauri/src/server/migrations.rs`다. (server-setup D15, D24)

## 명령어 (apps/desktop에서 실행)
- 의존성 설치: `npm install`
- 실행 (개발 모드, 창이 뜨고 코드 수정 시 자동 반영): `npm run tauri dev`
- 빌드 (설치 파일 생성, 결과물은 src-tauri/target/release/bundle/): `npm run tauri build`
- 프론트엔드만 빌드 (타입 검사 포함): `npm run build`
- 타입 검사만: `npx tsc --noEmit`
- Rust 쪽만 컴파일 확인 (apps/desktop/src-tauri에서): `cargo check`
- 단위 테스트 (Vitest, 몇 초): `npm test`. 화면·Tauri 없는 순수 로직만 테스트하고, 파일은 원본 옆 `*.test.ts`. 시간대는 vitest.config.ts에서 서울로 고정한다. 순수 로직을 고치면 돌리고, 새 순수 로직에는 테스트를 같이 쓴다.
- 화면 확인은 브라우저 미리보기(`desktop-web`)에 `?fixture=basic`(또는 `empty`)을 붙여 예시 데이터로 연다. 방식은 docs/desktop/common/ai/testing.md
- 설치 파일 배포·버전 올리기 절차: docs/desktop/common/ai/setup/desktop-release.md
