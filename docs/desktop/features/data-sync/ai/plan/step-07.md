# 데이터 동기화 7단계: 계정 확인·안전 점검·전체 빌드

- 요구사항: R16, R25, R28, 전체
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D4, D5

## 할 일
- 계정 확인 (R16): `serverSession.userId`가 sync.json `userId`와 다르면 자동 올리기를 멈추고 설정 구역 위에 "다른 계정으로 로그인했습니다" 안내 + [이 계정으로 동기화].
- 새 `pages/settings/SyncAccountDialog.tsx` (ConfirmDialog): "<이메일> 계정으로 동기화를 시작합니다. 이 계정의 서버 내용과 다시 비교합니다." → 확인하면 종류마다 rev·hash를 비우고 `userId`를 바꾼 뒤 4단계 enable 흐름(비교)을 다시 탄다. 로컬·서버 어느 쪽도 지우지 않는다.
- 안전 점검 (R25, R28): 로그아웃·연결 해제·동기화 끄기·서버 업데이트·자동 세팅 다시 실행 경로에서 sync 쪽이 로컬 파일·서버 행을 지우거나 쓰는 코드가 없는지 grep으로 확인한다 (`write`·`delete`·`remove` 호출 위치).
- 안 쓰는 코드·임시 로그 정리, `npx tsc --noEmit`, `cargo check`, `npm run tauri build`.

## 확인할 결과
- 다른 Google 계정으로 로그인하면 자동으로 올리지 않고 안내가 보인다. 확인하면 그 계정 서버와 비교해 올라가고, 원래 계정의 서버 행은 그대로다(대시보드에서 user_id별 행 확인).
- 로그아웃 → 다시 로그인하면 로컬 파일과 서버 행이 그대로이고, 로그아웃 중 고친 내용은 "대기"였다가 올라간다.
- 설정 › 서버 연결 › 자동 세팅 다시 실행 뒤에도 `sync_documents` 행과 rev가 그대로다.
- `npm run tauri build` 성공 (설치 파일 생성).

## 이 단계에서 만들거나 고칠 파일
- 새 `pages/settings/SyncAccountDialog.tsx`
- `features/sync/SyncProvider.tsx`, `features/sync/useUploadQueue.ts`, `pages/settings/SyncSection.tsx`
