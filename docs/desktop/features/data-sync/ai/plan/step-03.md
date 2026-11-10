# 데이터 동기화 3단계: 판정·서버 호출

- 요구사항: R1, R2, R13, R15, R18, R22
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1, D4, D6, D8

## 할 일
- 새 `features/sync/kinds.ts`: 종류 4개(R1)만 정의한다. 그 밖의 파일(R2)은 목록에 없다.
  - 종류마다 `label`(플랜·캘린더·지원 관리·투데이), `readLocal()` → `{ kind: "ok", data, empty } | { kind: "unreadable", message }` (load 명령 + `parseXData`, 파일이 없으면 빈 데이터, R13), `writeLocal(data)`(기존 save 명령), `parse(value)`(서버 데이터 검사, R22), `fileVersion`.
  - 빈 데이터 판정은 index.md "작은 규칙"대로.
- 새 `features/sync/stableJson.ts`: 키를 정렬한 JSON 문자열, `hashOf(value)`(crypto.subtle SHA-256 → 16진수). 배열 순서는 그대로 둔다.
- 새 `features/sync/compare.ts`: `decide(server, local, last)` → `Verdict` (R18).
  - 서버 없음 → "upload" / 서버 있음·로컬 빔 → "ask-pull" (R15) / 해시 같음 → "same" / 그 밖 → "choose".
  - 이미 맞춘 적 있고(last.rev = 서버 rev) 로컬만 바뀌었으면 "upload" (평소 올리기).
- 새 `features/sync/serverApi.ts` (세션 클라이언트만 씀, R6):
  - `fetchDoc(client, kind)` → 행 또는 null (data·file_version·rev·updated_at·device).
  - `pushDoc(client, kind, data, fileVersion, baseRev, device)` → `{ ok: true, rev, updatedAt } | { ok: false, conflict: {…} } | { ok: false, error }`. 네트워크·인증 오류는 error로 구분해 "대기"로 돌릴 수 있게 한다.
  - 서버 데이터의 `file_version`이 앱 버전보다 크면 받지 않는다 (R22).

## 확인할 결과
- `npm run build` 성공.
- Node로 `compare.ts`를 실행한 결과가 R18 표와 같다:
  | 서버 | 로컬 | last | 결과 |
  |---|---|---|---|
  | 없음 | 내용 있음 | 없음 | upload |
  | 없음 | 빔 | 없음 | upload |
  | rev 3, 내용 A | 빔 | 없음 | ask-pull |
  | rev 3, 내용 A | 내용 A(키 순서만 다름) | 없음 | same |
  | rev 3, 내용 A | 내용 B | 없음 | choose |
  | rev 3, 내용 A | 내용 B | rev 3 | upload |
  | rev 4, 내용 C | 내용 B | rev 3 | choose |
- `{b:1,a:{d:2,c:3}}`와 `{a:{c:3,d:2},b:1}`의 `hashOf`가 같고, `[1,2]`와 `[2,1]`은 다르다.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/sync/kinds.ts`, `features/sync/stableJson.ts`, `features/sync/compare.ts`, `features/sync/serverApi.ts`
