# server-setup AI 테스트 r1 (2026-10-26)

## 테스트 환경
- Windows 11 Pro, Node v24.20.0, rolldown 1.2.14(apps/desktop 의존성), Rust cargo
- 앱·미리보기는 띄우지 않았고, 실제 Supabase·Anthropic·Google 서버에는 접속하지 않음

## 방법
- 빌드: `npm run build`, `npx tsc --noEmit`, `cargo check`, `npm run tauri build`
- 순수 함수: 임시 폴더에 진입 파일을 두고 supabase-js·Tauri를 가짜 모듈로 바꿔 묶은 뒤 `node`로 실행 (A4–A8, A20 일부, 확인 39건 통과)
- 나머지: 판정에 필요한 함수·SQL·서버 함수만 읽어 코드로 판정

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | 프론트엔드 빌드·타입 검사 | 통과 | common.md |
| A2 | cargo check | 통과 | common.md |
| A3 | tauri build 설치 파일 | 통과 | common.md |
| A4 | 주소 형식 검사 | 통과 | onboarding.md |
| A5 | 키 종류 판정 | 통과 | onboarding.md |
| A6 | ref 추출·리디렉션 주소 | 통과 | onboarding.md |
| A7 | 접속 결과 구분·4갈래 | 통과 | onboarding.md |
| A8 | 상태 7가지·띠 | 통과 | health.md |
| A9 | 1번 SQL | 통과 | migrations.md |
| A10 | 단계 한 묶음 적용 | 통과 | migrations.md |
| A11 | include_str!·최신 번호 | 통과 | migrations.md |
| A12 | health·ai-key-check | 통과 | auth.md |
| A13 | 자동 세팅 6단계·재실행 | 통과 | auto-setup.md |
| A14 | 비밀값 저장·출력 안 함 | 통과 | auto-setup.md |
| A15 | 하드코딩 없음·.env | 통과 | common.md |
| A16 | Google 로그인 흐름 | 통과 | auth.md |
| A17 | 자격 증명 관리자·복원 | 통과 | auth.md |
| A18 | 접속 확인 비차단·간격 | 통과 | health.md |
| A19 | PAT로 재개 | 통과 | health.md |
| A20 | 번호 불일치 처리 | 통과 | migrations.md |
| A21 | 관리 작업 | 통과 | settings.md |
| A22 | 첫 실행 안내 조건 | 통과 | onboarding.md |
| A23 | 세팅 전 사전 확인 | 통과 | auto-setup.md |
| A24 | 외부 링크·키 미표시·팝업 | 통과 | settings.md |

## 실패 항목
없음

## 참고 사항
- A6: 예시 그대로의 `https://abcd.supabase.co`는 ref 길이 규칙(10~40자) 때문에 형식 오류. 20자 ref로는 기대대로 나옴
- 실제 서버로 확인하지 못한 추측: 일시정지 응답 540·상태 `INACTIVE`, 거부 응답 `signup_disabled`, 리디렉션 포트 와일드카드, 관리 API에서 begin/commit 묶음 동작 → 사용자 테스트에서 확인 필요
- 저장 위치(코드 기준): server.json은 `%APPDATA%\com.daybrick.desktop\server.json`, 로그인은 자격 증명 관리자 일반 자격 증명 `Daybrick/<프로젝트 ref>`(사용자 이름 `Daybrick`)
