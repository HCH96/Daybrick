# 데이터 동기화 (data-sync) 작업 노트
갱신: 2026-11-08

## 완료
- 1단계: 서버 테이블·RPC (0010) (자동 진행, 최종 테스트 대기)
- 2단계: 로컬 파일 기반 (sync.json·백업·parse 분리) (자동 진행, 최종 테스트 대기)
- 3단계: 판정·서버 호출 (자동 진행, 최종 테스트 대기)
- 4단계: 켜기와 설정 구역 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 자동 올리기 (notifySaved·5초 모으기 대기열·대기 재시도·창 닫을 때 한 번·[지금 올리기])
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `SyncProvider.tsx`·`useSync.ts`·`SyncSection.tsx`는 고칠 파일이라 통째로 읽는다. `syncKindOnEnable`(SyncProvider 안)의 올리기·실패 처리(`failed`)를 대기열에서 다시 쓸 수 있다. kinds.ts·serverApi.ts·stableJson.ts·compare.ts는 export만 grep으로 본다. 각 `useAutoSave.ts`는 저장 성공 지점만 찾아 고친다.

## 확인할 문서 (경로는 docs/features/data-sync/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-upload.md (R9–R12, R14), ai/spec/req-safety.md (R24, R26), ai/spec/req-settings.md (R30)
- ai/logs/L06.md
- ai/plan/structure.md의 1절 "새 동기화" 표 (useUploadQueue·useCloseFlush 위치)
- apps/desktop/src/features/sync/types.ts (가져다 쓸 타입)
