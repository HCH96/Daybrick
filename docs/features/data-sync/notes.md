# 데이터 동기화 (data-sync) 작업 노트
갱신: 2026-11-08

## 완료
- 1단계: 서버 테이블·RPC (0010) (자동 진행, 최종 테스트 대기)
- 2단계: 로컬 파일 기반 (sync.json·백업·parse 분리) (자동 진행, 최종 테스트 대기)
- 3단계: 판정·서버 호출 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 켜기와 설정 구역 (useSync·SyncProvider, 켤 때 종류별 비교·올리기, 설정의 "데이터 동기화" 구역)
- 관련 결정: D1, D2, D3, D4, D5, D6, D8, D9, D10, D11 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `features/sync/`의 kinds.ts(`KINDS`)·compare.ts(`decide`, ServerSide·LocalSide)·serverApi.ts(`fetchDoc`·`pushDoc`, SyncError)·stableJson.ts(`hashOf`)·syncFile.ts는 export만 grep으로 본다. 기기 이름은 Tauri 명령 `sync_device_name`. 설정 화면 모양은 `ServerSectionConnected`의 `settings-row`·`settings-btn` 클래스를 grep으로 본다. `useServer()`는 status·serverSession export만 본다.

## 확인할 문서 (경로는 docs/features/data-sync/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-storage.md (R7), ai/spec/req-first-sync.md (R17, R18), ai/spec/req-safety.md (R27), ai/spec/req-settings.md (R29, R32, 화면 구성)
- ai/logs/L05.md
- ai/plan/structure.md의 1절 "새 동기화"·"새 화면" 표와 3절 컴포넌트 구조
- apps/desktop/src/features/sync/types.ts (가져다 쓸 타입)
