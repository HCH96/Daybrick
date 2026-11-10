# 데이터 동기화 5단계: 자동 올리기

- 요구사항: R9–R12, R14, R24, R26, R30
- 목업: 없음 (명세 화면 구성의 [지금 올리기])
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3, D6, D7, D8

## 할 일
- `features/*/useAutoSave.ts` (4개): `savePlanData` 등이 성공한 뒤에만 `notifySaved(kind)`를 부른다. 로컬 저장 흐름·0.5초 대기는 그대로 (R9).
- 새 `features/sync/useUploadQueue.ts` (SyncProvider 안에서 씀):
  - `notifySaved(kind)` → 그 종류를 "대기"로 두고 sync.json에 저장(R11, 다시 켜도 남음) → 5초 타이머를 다시 건다 (D7).
  - 타이머가 끝나면 대기 종류마다: `readLocal`(못 읽으면 "skipped", R13) → 해시가 마지막 맞춘 해시와 같으면 "맞음"으로만 돌림 → 빈 데이터인데 서버에 내용이 있었던 종류면 올리지 않고 "선택 필요"(R15) → `pushDoc(baseRev = last.rev)`.
  - 성공: rev·hash·syncedAt 기록, "맞음". 충돌: 그 종류만 "선택 필요"로 두고 자동 올리기 멈춤 (R14, R20). 네트워크·로그인 오류: "대기" 유지, 오류 문구 저장 (R24).
  - 꺼져 있거나 막혀 있으면(로그인 풀림·오프라인·서버 업데이트) 올리지 않고 "대기"만 남긴다 (R24).
  - `serverSession`이 없다가 생기면(다시 로그인) 대기 종류를 바로 한 번 올린다 (R26). 앱을 켰을 때 대기가 남아 있어도 같다.
  - 한 번에 하나씩 올린다(같은 종류가 겹쳐 올라가지 않게).
- 새 `features/sync/useCloseFlush.ts` (R12): 창 닫기 요청 때 대기 종류를 최대 3초 동안 한 번 올린다. 시간이 지나거나 실패해도 닫기는 막지 않는다(대기 표시는 남아 다음 실행 때 올라감).
  - 기능 useAutoSave의 닫기 저장이 먼저 끝나야 한다. 실제로 순서를 보고, 늦으면 "로컬 저장 대기(최대 1초) → 올리기"로 맞춘다.
- `SyncSection.tsx`: [지금 올리기] 버튼 (R30). 대기 종류가 없으면 흐리게, 누르면 타이머를 기다리지 않고 바로 올림.

## 확인할 결과
- `npm run build` 성공.
- 동기화를 켠 채 플랜 태스크 제목을 고치면 설정에 "대기"가 보이고, 5초쯤 뒤 "맞음 · 방금 올림". 대시보드의 plan 행 rev가 1 늘고 data에 새 제목이 있다.
- 인터넷을 끊고 캘린더 일정을 추가하면 로컬에는 저장되고 "대기"로 남는다. 앱을 껐다 켜도 "대기"이고, 인터넷을 다시 연결한 뒤 [지금 올리기]나 다시 로그인하면 올라간다.
- 대시보드에서 plan 행의 rev를 직접 바꾼 뒤 태스크를 고치면 plan만 "선택 필요"가 되고 서버 내용은 덮이지 않는다. 다른 종류는 계속 올라간다.
- 창을 닫기 직전에 고친 내용도 다음에 켰을 때 서버에 있거나 "대기"로 남는다 (어느 쪽인지 기록).
- 투데이 타이머가 도는 동안 1분쯤마다 today 행 rev가 늘어난다 (너무 잦지 않은지 확인).

## 이 단계에서 만들거나 고칠 파일
- `features/plan/useAutoSave.ts`, `features/calendar/useAutoSave.ts`, `features/applications/useAutoSave.ts`, `features/today/useAutoSave.ts`
- 새 `features/sync/useUploadQueue.ts`, `features/sync/useCloseFlush.ts`
- `features/sync/SyncProvider.tsx`, `features/sync/useSync.ts`, `pages/settings/SyncSection.tsx`
