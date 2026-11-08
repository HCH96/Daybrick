# 데이터 동기화 (data-sync) 작업 노트
갱신: 2026-11-08

## 완료
- 1단계: 서버 테이블·RPC (0010) (자동 진행, 최종 테스트 대기)
- 2단계: 로컬 파일 기반 (sync.json·백업·parse 분리) (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 판정·서버 호출 (kinds.ts·stableJson.ts·compare.ts·serverApi.ts, compare·hashOf는 Node로 실행 확인)
- 관련 결정: D1, D2, D3, D4, D5, D6, D8, D10 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: kinds.ts는 각 storage.ts의 `parseXData`·`X_FILE_VERSION`·`createEmpty…Data`, 기존 load/save 명령 이름(`load_plan` 등)을 grep으로만 본다. 세션 클라이언트는 `features/server/session.ts`의 export만 grep으로 본다. Node 확인 스크립트는 저장소 밖 임시 폴더에 둔다.

## 확인할 문서 (경로는 docs/features/data-sync/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/plan/index.md의 "작은 규칙" 구역 (빈 데이터 판정)
- ai/spec/req-storage.md (R1, R2, R6), ai/spec/req-upload.md (R13, R15), ai/spec/req-first-sync.md (R18, R22)
- ai/logs/L04.md
- ai/plan/structure.md의 1절 "새 동기화" 표와 2절 데이터 모양 (Verdict·daybrick_sync_push 응답 모양)
- apps/desktop/src/features/sync/types.ts (가져다 쓸 타입)
