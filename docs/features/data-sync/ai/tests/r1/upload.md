# r1 · 자동 올리기 (req-upload: R9–R16)

## A12 · 로컬 저장 먼저, 5초 모아 바뀐 종류만, 실패해도 저장 안 막음
- 근거: R9, R10, D7
- 수행: `features/plan/useAutoSave.ts` flush 읽기, 나머지 3종 useAutoSave의 notifySaved 위치 grep, `sync/useUploadQueue.ts` 전체 읽기
- 예상: 저장 성공 뒤에만 알림, 5초 모음, 바뀐 종류만, 올리기 실패가 저장에 영향 없음
- 실제: flush는 `await savePlanData` 성공 뒤 `notifySaved("plan")`을 부름(calendar·applications·today도 같은 위치). notifySaved는 동기 함수로 대기 표시·타이머만 걸고 반환, 올리기는 `GATHER_MS = 5_000` 타이머가 끝난 뒤 별도 Promise로 돎. 대상은 `targets()` — "대기"이거나 이번 실행에 저장된(dirty) 종류만. 올리기 예외는 run 안 try/catch에서 로그만 남김
- 판정: 통과

## A13 · 대기를 sync.json에 남김, 쓰기 차례대로, 꺼져 있으면 대기 안 남김
- 근거: R11, R27
- 수행: `useUploadQueue.ts` notifySaved, `SyncProvider.tsx` commit 읽기
- 예상: 일치
- 실제: notifySaved가 state를 "pending"으로 바꿔 commit(→ save_sync_state). commit은 `saveChainRef`에 이어 붙여 앞 쓰기가 끝난 뒤 최신 `fileRef.current`를 씀. `current && !current.enabled`면 바로 반환해 대기·타이머를 남기지 않음
- 판정: 통과

## A14 · 창 닫기
- 근거: R12
- 수행: `sync/useCloseFlush.ts` 전체, plan·notifications useAutoSave의 onCloseRequested 읽기, 나머지 grep
- 예상: 로컬 저장(약 1초) 뒤 올리기(약 3초 제한), 닫기 막지 않음, notifications도 같은 방식
- 실제: `LOCAL_WAIT_MS = 1_000`, `UPLOAD_WAIT_MS = 3_000`. 로컬 저장들을 최대 1초 기다린 뒤 uploadNow를 최대 3초 race, 올리기 예외는 catch로 삼킴. 각 기능 처리기는 `closeFlush(flush())`를 await하고 끝나면 창이 닫힘(allSettled라 실패해도 진행). plan·calendar·applications·today·notifications 5곳 모두 onCloseRequested에서 closeFlush 사용
- 판정: 통과

## A15 · 로컬 파일 못 읽음/모르는 버전이면 올리지 않음
- 근거: R13
- 수행: `kinds.ts` readLocal, `useUploadQueue.ts` uploadKind, `SyncProvider.tsx` syncKindOnEnable 읽기
- 예상: 일치
- 실제: readLocal은 load 명령이나 각 기능 parse(모르는 버전이면 예외)가 실패하면 `unreadable` 반환. uploadKind·syncKindOnEnable·keepLocal 모두 unreadable이면 pushDoc 전에 state "skipped"로 반환
- 판정: 통과

## A16 · 충돌 시 그 종류만 멈추고 선택 필요
- 근거: R14, R20
- 수행: `useUploadQueue.ts` uploadKind·targets 읽기
- 예상: 일치
- 실제: push 결과가 conflict면 그 종류만 state "choice". targets()는 state가 "choice"인 종류를 빼므로 그 종류만 자동 올리기에서 빠지고, runOnce의 for 문은 다른 종류를 계속 처리
- 판정: 통과

## A17 · 로컬 빔 + 서버 내용 있음이면 자동으로 올리지 않음, 시작 시 checkEmptyLocal
- 근거: R15
- 수행: `useUploadQueue.ts` uploadKind, `resolve.ts` checkEmptyLocal, `SyncProvider.tsx` 처음 useEffect 읽기
- 예상: 일치
- 실제: uploadKind는 해시가 마지막과 같으면 "ok"만, 아니면 `local.empty && prev.rev !== null`이면 올리지 않고 "choice". prev.rev가 null(맞춘 적 없음)이면 base null로 올리는데 서버에 행이 있으면 RPC가 충돌을 돌려줘 "choice"가 되므로 덮지 않음. 시작 시 sync.json을 읽고 켜져 있으면 종류마다 `checkEmptyLocal` — rev가 있고 로컬이 빈 데이터이며 해시가 다르면 "choice"로 commit
- 판정: 통과

## A18 · 계정 다르면 올리지 않음
- 근거: R16
- 수행: `SyncProvider.tsx` accountMismatch·client·enable·forgetServerSide 읽기
- 예상: 일치
- 실제: `accountMismatch = file.enabled && serverSession && file.userId !== serverSession.userId`. `client`는 accountMismatch면 null이라 runOnce가 올리지 않고 inspect·resolveWith도 서버를 부르지 않음. enable은 userId가 다르면 forgetServerSide로 종류마다 rev·hash·syncedAt을 null로 비운 뒤 새 userId로 저장하고 다시 비교
- 판정: 통과
