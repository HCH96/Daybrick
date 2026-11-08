# 데이터 동기화 결정 사항

- D1. 동기화 방식은 A안이다: 기능별로 통째로 한 행(JSONB). 동시 편집 시 마지막 저장이 이기지만 리비전 검사로 자동 덮어쓰기는 막는다. (적용: 이후 전체) (기록: L01)
- D2. 본문 이미지는 이번 범위에서 제외하고, 본문 경로는 바꾸지 않는다. (적용: 이후 전체) (기록: L01)
- D3. 자동 올리기와 설정 화면의 수동 "지금 올리기"를 함께 둔다. (적용: 이후 전체) (기록: L01)
- D4. PC 한 대와 재설치 복구를 기준으로 한다. 평소에는 로컬이 이기고, 서버가 로컬을 덮는 건 사용자가 고를 때만이다. (적용: 이후 전체) (기록: L01)
- D5. 덮어쓰기 전에는 항상 백업 파일을 남기고, 로그인 풀림·로그아웃·끄기로는 어떤 데이터도 지우지 않는다. (적용: 이후 전체) (기록: L01)
- D6. 서버 쓰기는 RPC `daybrick_sync_push` 하나로만 한다. 리비전이 같을 때만 쓰고 rev를 1 올리며, 다르면 충돌(지금 rev·시각·기기)을 돌려준다. 행이 없을 때는 base_rev null로 넣기만 한다. 테이블은 본인 행 select만 열고 insert·update·delete 권한은 주지 않는다. (적용: 1단계 이후 전체) (기록: L02)
- D7. 자동 올리기는 로컬 저장 성공 뒤 5초 동안 모아서 바뀐 종류만 올린다. 한 번에 한 종류씩 올리고, 창을 닫을 때는 최대 3초만 시도한다. (적용: 5단계 이후 전체) (기록: L02)
- D8. 기능은 저장 성공만 알리고(`notifySaved`), 올릴 내용은 동기화가 로컬 파일을 다시 읽어 검사한 뒤 만든다. 서버와 "같음"은 키를 정렬한 JSON의 SHA-256 해시로 비교하고, 마지막으로 맞춘 해시와 같으면 올리지 않는다. (적용: 3단계 이후 전체) (기록: L02)
- D9. `SyncProvider`는 `ServerProvider` 안, 기능 Provider 바깥에 둔다. 서버 내용을 받으면 각 기능 store가 `useSyncReload`로 등록한 다시 읽기 함수를 부른다. (적용: 4단계 이후 전체) (기록: L02)
- D10. 기능 파일 검사는 각 `storage.ts`의 `parseXData(raw)`(동기, 저장 안 함)와 `X_FILE_VERSION` 상수로 한다. 지원 관리의 v1 → v2 옮기기도 parse 안에서 메모리로만 하고, 옮긴 파일 저장은 `loadApplicationsData`만 한다. 백업 파일 이름 시각은 PC 현지 시각(chrono)이고, 같은 초에 겹치면 `-2`, `-3`을 붙인다. (적용: 3단계 이후 전체) (기록: L04)
- D11. `decide(server, local, last)`는 데이터 대신 해시·빈 데이터 여부(서버는 rev도)를 받는 순수 함수다. 순서는 서버 없음 → upload, 해시 같음 → same, 로컬 빔·서버 내용 있음 → ask-pull, last.rev = 서버 rev → upload, 그 밖 → choose. `fetchDoc`·`pushDoc`는 예외를 던지지 않고 결과로 돌려주며, 오류 종류 network·auth는 "대기", too-new(서버 file_version이 앱보다 큼, fetchDoc에서 거름)·server·bad-response는 "오류"로 다룬다. 서버 data 검사는 `KINDS[kind].parse(value)`(JSON 문자열로 바꿔 parseXData)로 한다. (적용: 4단계 이후 전체) (기록: L05)
- D12. 동기화 막힘 이유(`blocked`)는 `useServer()`로 정한다: 연결 정보 없음·status off → off, app-update, server-update, `serverSession` 없음 → login, 그 밖은 null (paused·unreachable은 막지 않고 올리기 실패 시 "대기"). 막혀 있으면 켤 수 없지만 끄기는 된다. 서버 쪽 해시는 `KINDS[kind].parse(doc.data)` 결과로 만들어 로컬과 같은 검사를 거친 값끼리 비교하고, parse 실패는 "오류"다. 올리기 충돌(R14)은 "선택 필요"로 둔다. "같음"의 syncedAt은 서버 행의 updated_at이다. sync.json은 종류 하나를 처리할 때마다 저장한다. (적용: 4단계 이후 전체) (기록: L06)
