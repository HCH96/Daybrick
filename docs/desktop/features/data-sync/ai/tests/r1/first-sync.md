# r1 · 처음 맞추기·선택·받아오기 (req-first-sync: R17–R23)

## A9 · compare.ts 판정 표 + 판정 순서
- 근거: R18, R15
- 수행: 임시 폴더에 `a9a10.mts`를 만들어 `compare.ts`·`stableJson.ts`를 그대로 가져와 `node --experimental-strip-types --no-warnings a9a10.mts`로 실행 (Node v24.20.0)
- 예상: step-03 "확인할 결과" 표 7가지와 같고, 해시 같음을 먼저 보고, ask-pull은 서버에 내용이 있을 때만, 둘 다 빈 데이터인데 해시(view 등)만 다르면 choose
- 실제: 7가지 모두 기대값과 같음 (upload, upload, ask-pull, same, choose, upload, choose). 순서 검사 4건도 통과 — 둘 다 빈 데이터·해시 같음 → same / 둘 다 빈 데이터·해시 다름·last 없음 → choose / 같은 조건에 last rev가 서버와 같음 → upload / 로컬 빔·서버 내용 있음이면 last rev가 같아도 ask-pull. 출력 마지막 줄 "ALL PASS"
- 판정: 통과

## A10 · stableJson hashOf
- 근거: D8
- 수행: 위 스크립트에서 함께 실행
- 예상: 키 순서만 다르면 같은 해시, 배열 순서가 다르면 다른 해시
- 실제: `{b:1,a:{d:2,c:3}}`와 `{a:{c:3,d:2},b:1}` 해시 같음, `[1,2]`와 `[2,1]` 다름. 해시는 64자 16진수, stableStringify 결과 `{"a":{"c":3,"d":2},"b":1}`
- 판정: 통과

## A11 · 종류별 빈 데이터 판정
- 근거: R15
- 수행: `kinds.ts`의 4종 isEmpty, `plan/index.md`의 "빈 데이터" 줄 비교
- 예상: 플랜 카테고리·태스크·프로젝트 모두 없음 / 캘린더 일정 없음 / 지원 카드 없음 / 투데이 기록·도는 타이머 없음
- 실제: plan `categories·tasks·projects` 길이 모두 0, calendar `events` 0, applications `applications` 0, today `records` 0이고 `running === null`. 계획 정의와 같음
- 판정: 통과

## A19 · 받아오기 검사, 새 버전 거부, 자동으로 덮는 경로 없음
- 근거: R22
- 수행: `serverApi.ts` fetchDoc, `resolve.ts` takeServer, `grep -rn "takeServer|writeLocal|keepLocal" src`
- 예상: 일치
- 실제: fetchDoc은 행 모양(file_version·rev·updated_at)이 틀리면 bad-response, `file_version > 앱 버전`이면 too-new로 거부. takeServer는 `def.parse(doc.data)`(기능별 parse로 버전·모양 검사)가 실패하면 쓰지 않음. 로컬을 덮는 `writeLocal`은 takeServer 안에서만 쓰이고, takeServer는 설정 화면의 선택창(SyncChoiceDialog)과 종류 줄의 받아오기(SyncKindRow, 확인 단계 뒤 pull)에서만 부름. 켜기·자동 올리기 경로(syncKindOnEnable·uploadKind)는 받아오기 대신 "choice"로만 둠
- 판정: 통과

## A20 · 백업 Rust
- 근거: R21, R33
- 수행: `src-tauri/src/sync.rs` 전체, `resolve.ts` keepLocal·takeServer의 백업 순서 읽기
- 예상: kind 허용 목록(그 밖 오류), 덮이는 쪽 덮기 전 백업, 파일명 현지 시각, 같은 초 -2, has_sync_backups
- 실제: `write_sync_backup`은 KINDS 4종이 아니면 `Err("모르는 종류입니다")`. 파일명 `<kind>-<chrono::Local %Y%m%d-%H%M%S>.json`, 이미 있으면 `-2`, `-3`… 붙임. `has_sync_backups`는 폴더의 .json 하나라도 있으면 true(폴더 없으면 false). keepLocal은 서버 행을 다시 읽어 그 내용을 백업한 뒤 push, takeServer는 로컬 원본(readRaw)을 백업한 뒤 writeLocal. 둘 다 백업 실패 시 덮지 않고 반환
- 판정: 통과

## A21 · 받아온 뒤 다시 읽기, 투데이 타이머 닫기
- 근거: R23
- 수행: `resolve.ts` takeServer, `SyncProvider.tsx` registerReload·takeServer, 4종 store의 `useSyncReload` grep, `today/store.tsx` reload·복구 effect 읽기
- 예상: 일치
- 실제: takeServer는 writeLocal 뒤 등록된 reload를 부름(SyncProvider가 `reloadsRef.get(kind)`를 넘김). plan·calendar·applications·today store 모두 useSyncReload 등록. 투데이 reload는 파일을 다시 읽어 dispatch("loaded") 후 `setRecovered(false)` — 복구 effect가 다시 돌아 남은 running을 "recover"로 닫음(시작 때와 같은 lastSeenAt 복구)
- 판정: 통과
