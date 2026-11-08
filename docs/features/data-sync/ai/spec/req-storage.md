# 데이터 동기화 요구사항: 대상·서버 저장 (R1–R8)

### 대상·서버 저장
- R1. 동기화 대상은 plan(카테고리·태스크·프로젝트·화면 상태 포함), calendar, applications, today 네 종류의 로컬 파일 내용이다.
- R2. 그 밖의 로컬 데이터(images/, job-search.json, notifications.json, server.json, 로그인 토큰, 사이드바 접힘)는 올리지 않는다.
- R3. 서버에는 사용자·종류마다 한 행을 두고, 로컬 파일 내용을 그대로(JSONB) 파일 버전·리비전 번호·수정 시각·올린 기기 이름과 함께 저장한다.
- R4. 새 테이블은 다음 서버 구조 번호(0010) 마이그레이션으로 추가하고, 기존 "서버 업데이트" 흐름으로 적용한다. 다시 실행해도 안전해야 한다.
- R5. 새 테이블은 RLS를 켜고 로그인한 본인 행(user_id = auth.uid())만 읽고 쓸 수 있다. anon은 접근할 수 없다.
- R6. 앱은 service_role 키를 쓰지 않고 로그인 세션(anon key + 사용자 토큰)으로만 읽고 쓴다.
- R7. 서버 구조 번호가 10보다 낮으면 동기화하지 않고 "서버 업데이트 필요"를 안내하며 로컬만 쓴다.
- R8. 행에 연결 정보·비밀값을 넣지 않는다. 나중에 웹·폰이 URL·anon key와 Google 로그인만으로 같은 행을 읽을 수 있는 모양을 유지한다.

### 확인한 로컬 데이터 (2026-11-08, 앱 데이터 폴더 `%APPDATA%\com.daybrick.desktop`)
| 파일 | 내용 | 대상 |
|---|---|---|
| plan.json | 카테고리·태스크·프로젝트·view | 예 |
| calendar.json | 개인 일정 | 예 |
| applications.json | 지원 카드·속성·마크다운 본문 | 예 |
| today.json | 집중 기록·도는 타이머·하루 목표 (이 PC엔 아직 없음) | 예 |
| images/ | 지원 관리 본문 이미지 | 아니오 (D2) |
| job-search.json, notifications.json | 각 기능 내부 상태 | 아니오 |
| server.json, 자격 증명 관리자 토큰, localStorage | 이 PC 설정 | 아니오 |
