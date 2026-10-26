# 서버 연결: 다룰 데이터

| 데이터 | 주요 항목 | 저장 위치 |
|---|---|---|
| 서버 연결 정보 | Supabase 주소, anon/publishable 키, 연결 날짜 | PC 앱 설정 파일 |
| 첫 실행 기록 | "나중에 하기" 누름 여부 | PC 앱 설정 파일 |
| 마지막 접속 결과 | 상태, 시각 | PC 앱 설정 파일 |
| 로그인 정보 | Supabase Auth 토큰 | Windows 자격 증명 관리자 |
| 서버 구조 기록 | 번호, 적용 시각, 적용한 앱 버전 | 테이블 (읽기 전용) |
| 서버 상태 | Anthropic 키 등록일 (`user_id`) | 테이블 (RLS) |
| 계정 | Google 계정 이메일, Google 연결 정보 (비밀번호 없음) | Supabase Auth |
| 허용 계정 | 주인으로 등록한 Google 계정 | 서버 (방법은 계획 단계에서 확정) |
| Google OAuth 클라이언트 | ID, 비밀값 | Supabase 인증 설정 + 서버 함수 비밀값 (PAT로 등록, 앱에 저장 안 함) |
| Anthropic API 키 | 키 값 | 서버 함수 비밀값만 |
| Supabase PAT | 토큰 값 | 저장 안 함 (세팅·업데이트·재개 중 메모리에만) |

**서버 함수 (1번 단계)**: 접속 확인(로그인 사용자 확인, DB 읽기, 구조 번호 반환), AI 키 확인(비밀값의 Anthropic 키로 요금 없는 호출).

**비밀값 규칙**: anon/publishable 키는 공개돼도 되는 값이라 설정 파일에 둔다. PAT, Anthropic 키, Google 클라이언트 비밀값, service role 키는 앱 설정 파일·로그·코드·저장소 어디에도 두지 않는다.
