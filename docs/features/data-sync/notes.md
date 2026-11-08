# 데이터 동기화 (data-sync) 작업 노트
갱신: 2026-11-08

## 완료
- 1단계: 서버 테이블·RPC (0010) (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 로컬 파일 기반 (sync.json·백업·parse 분리) (Rust sync.rs 명령, 4개 storage.ts의 parseXData 분리, sync/types.ts·syncFile.ts)
- 관련 결정: D1, D2, D3, D4, D5, D8 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 2단계는 서버를 건드리지 않는다. storage.ts 분리는 동작을 바꾸지 않는다.

## 확인할 문서 (경로는 docs/features/data-sync/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/plan/index.md의 "작은 규칙" 구역 (파일 이름·기기 이름·빈 데이터)
- ai/spec/req-upload.md (R11, R13), ai/spec/req-first-sync.md (R21), ai/spec/req-settings.md (R33)
- ai/spec/data.md (로컬 동기화 상태·백업 파일 모양)
- ai/logs/L03.md
- ai/plan/structure.md의 1절 파일 표(sync.rs·storage.ts·features/sync/ 줄)와 2절 데이터 모양 (types.ts를 만들 때)
