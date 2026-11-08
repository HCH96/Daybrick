# 데이터 동기화 (data-sync) 작업 노트
갱신: 2026-11-08

## 완료
- 1단계: 서버 테이블·RPC (0010) (자동 진행, 최종 테스트 대기)
- 2단계: 로컬 파일 기반 (sync.json·백업·parse 분리) (자동 진행, 최종 테스트 대기)
- 3단계: 판정·서버 호출 (자동 진행, 최종 테스트 대기)
- 4단계: 켜기와 설정 구역 (자동 진행, 최종 테스트 대기)
- 5단계: 자동 올리기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 선택창·받아오기·백업 (resolve.ts의 PC 남기기/서버 받기, store 4개 useSyncReload, SyncChoiceDialog, 종류별 받아오기·백업 폴더 열기)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `SyncProvider.tsx`·`useSync.ts`·`SyncSection.tsx`·`SyncKindRow.tsx`는 고칠 파일이라 통째로 읽는다. "PC 남기기" 올리기는 `useUploadQueue.ts`의 `failed`·`deviceName`(export)을 다시 쓸 수 있다. 받아온 뒤 기능 자동 저장이 `notifySaved`를 불러도 해시가 같아 "맞음"만 된다(D8). kinds.ts·serverApi.ts·stableJson.ts는 export만 grep으로 본다.

## 확인할 문서 (경로는 docs/features/data-sync/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-first-sync.md (R19–R23), ai/spec/req-upload.md (R15), ai/spec/req-settings.md (R31, R33, 화면 구성)
- ai/logs/L07.md
- ai/plan/structure.md의 1절 "새 동기화"·"새 화면" 표 (resolve.ts·SyncChoiceDialog 위치)
- apps/desktop/src/features/sync/types.ts (가져다 쓸 타입)
