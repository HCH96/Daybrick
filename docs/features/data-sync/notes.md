# 데이터 동기화 (data-sync) 작업 노트
갱신: 2026-11-08

## 완료
- 1단계: 서버 테이블·RPC (0010) (자동 진행, 최종 테스트 대기)
- 2단계: 로컬 파일 기반 (sync.json·백업·parse 분리) (자동 진행, 최종 테스트 대기)
- 3단계: 판정·서버 호출 (자동 진행, 최종 테스트 대기)
- 4단계: 켜기와 설정 구역 (자동 진행, 최종 테스트 대기)
- 5단계: 자동 올리기 (자동 진행, 최종 테스트 대기)
- 6단계: 선택창·받아오기·백업 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 계정 확인·안전 점검·전체 빌드 (계정 다를 때 자동 올리기 멈춤·SyncAccountDialog, 지우기·쓰기 경로 grep 점검, tsc·cargo check·tauri build)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 계정 확인은 `SyncProvider.tsx`(enable·useUploadQueue에 넘기는 `client`)와 `SyncSection.tsx`를 고친다. 계정이 다를 때는 `client`를 null로 넘기면 자동 올리기가 "대기"만 남긴다. 다시 비교는 기존 `enable` 흐름을 쓴다. `useUploadQueue.ts`·`resolve.ts`는 export만 grep으로 본다.

## 확인할 문서 (경로는 docs/features/data-sync/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-upload.md (R16), ai/spec/req-safety.md (R24–R28)
- ai/logs/L08.md
- ai/plan/structure.md의 1절 "새 화면" 표 (SyncAccountDialog 위치)
- apps/desktop/src/features/sync/types.ts (가져다 쓸 타입)
