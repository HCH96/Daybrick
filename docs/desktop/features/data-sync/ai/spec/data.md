# 데이터 동기화 데이터

| 항목 | 종류 | 저장 위치 |
|---|---|---|
| 동기화 문서: user_id, kind(plan·calendar·applications·today), data(JSONB, 로컬 파일 내용 그대로), file_version, rev(리비전), updated_at, device(올린 기기 이름) | 서버 테이블 1개, 기본 키 (user_id, kind), RLS 본인 행만 | 사용자 Supabase (마이그레이션 0010) |
| 동기화 상태: 켜짐 여부, 종류별 맞춘 리비전·시각·대기 여부·오류, 마지막 동기화 계정 id | 로컬 JSON | 앱 데이터 폴더 sync.json |
| 덮기 전 백업 | JSON 파일 | 앱 데이터 폴더 sync-backups/<종류>-<시각>.json |

- 원본은 각 기능의 로컬 파일(plan.json 등)이다. 서버 행은 복사본이다.
- 행에는 연결 정보·비밀값을 넣지 않는다 (R8).
