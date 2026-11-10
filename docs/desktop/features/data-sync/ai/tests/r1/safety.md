# r1 · 안전·막힘 (req-safety: R24–R28, req-settings: R7·R32 일부)

## A22 · 로그인 풀림·오프라인이면 올리기만 멈추고 대기 유지, 재로그인 시 검사 거쳐 올림
- 근거: R24, R26
- 수행: `SyncProvider.tsx` blocked·client, `useUploadQueue.ts` failed·runOnce·재시도 useEffect, `serverApi.ts` classify 읽기
- 예상: 일치
- 실제: 세션이 없으면 blocked "login" → client null → runOnce가 첫 줄에서 반환하고 "대기"는 sync.json에 그대로. 오프라인·인증 오류는 classify가 network/auth로 나누고 `failed()`가 state "pending"으로 둠(그 밖은 "error"). 다시 로그인하면 canUpload가 true로 바뀌어 useEffect가 run을 부르고, 각 종류는 uploadKind의 검사(못 읽음·해시 같음·빈 데이터·리비전 충돌)를 거쳐 올라감. 상태가 바뀔 때도 retryKey로 다시 시도
- 판정: 통과

## A23 · 로그아웃·연결 해제·끄기에 삭제 호출 없음
- 근거: R25, R27
- 수행: `grep -rn "sync_documents|.delete(|remove_file|remove_dir" src src-tauri/src`, `ServerProvider.tsx` logout, `server/config.rs` clear_server_connection, `SyncProvider.tsx` disable 읽기
- 예상: 로컬 파일 삭제·서버 행 삭제/수정 없음
- 실제: disable은 `enabled: false`만 commit(rev·hash 유지). logout은 `auth.signOut({scope:"local"})`과 저장된 로그인 삭제뿐. 연결 해제의 `remove_file`은 server.json 하나만 지움. sync_documents를 다루는 코드는 serverApi.ts의 select·rpc뿐이고 delete/update 호출 없음. 다른 `.delete(` 결과는 job-search·notifications 테이블이나 메모리 Set/Map
- 판정: 통과

## A24 · 서버 구조 번호 10 미만/앱 업데이트 필요 시 동기화 막고 안내
- 근거: R7, R32
- 수행: `server/health.ts` statusForSchema, `server/management.ts` getAppSchemaVersion, `migrations.rs` latest, `SyncProvider.tsx` blocked, `pages/settings/SyncSection.tsx`·`SyncNotice.tsx` grep
- 예상: 일치
- 실제: 앱 구조 번호는 Rust `latest_schema_version`(=10). 서버 번호가 작으면 "server-update", 크면 "app-update". blocked가 그 값을 그대로 받아 client null(올리기·고르기 안 함). SyncSection은 꺼져 있을 때 켜기 스위치를 막고(`!enabled && blocked !== null`), [지금 올리기]도 막으며, `SyncNotice`로 서버 업데이트/앱 업데이트 안내를 보여줌
- 판정: 통과 (참고: 브라우저 미리보기용 `PREVIEW_SCHEMA_VERSION = 5`는 Tauri 앱에서는 쓰이지 않음)
