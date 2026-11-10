# 자동 업데이트 3단계: 자동 확인·새 버전 알림

- 요구사항: R1, R2, R4–R9, R14
- 목업: 없음 (알림 모양은 notifications 기능 그대로)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3, D4, notifications extension.md

## 할 일
- 새 `features/updater/api.ts`: `updaterInfo`, `checkUpdate`, `downloadUpdate(onProgress)`, `installUpdate`, `discardUpdate`, `markUpdateNotified`. `isTauri()`가 아니면 쓸 수 없음으로 본다.
- 새 `features/updater/logic.ts` (순수 함수):
  - `compareVersions(a, b)`: `x.y.z` 숫자 비교 (-1/0/1).
  - `shouldNotify(found, lastNotified)`: lastNotified가 없거나 found가 더 크면 true (R7).
  - `isCheckDue(lastCheckedAt, now)`: 24시간 이상 지났으면 true (R2).
  - `progressPercent(downloaded, total)`: total이 없으면 null, 있으면 0–100 정수.
- 새 `features/updater/notices.ts`: `newVersionNotice(version)` → source `updater`, kind `update-available`, 정보, 제목 "새 버전 {v}이 나왔어요", 내용 "설정에서 설치할 수 있어요", target `{page:"settings", tab:"app"}`, mergeKey `update-available` (R6, R7, D3).
- 새 `features/updater/UpdaterProvider.tsx`:
  - 상태(phase)와 `info`(현재 버전·사용 가능), `useUpdater()`.
  - 켤 때 `updaterInfo` → 쓸 수 있으면 5초 뒤 자동 확인, 그 뒤 1시간마다 `isCheckDue`면 자동 확인 (R1, R2, D4). 확인 중·받는 중이면 건너뜀.
  - 자동 확인: 찾으면 `available` 상태 + `shouldNotify`면 `notify` 후 `markUpdateNotified`. 실패는 콘솔에만, 상태는 바꾸지 않음 (R9).
  - `checkNow()`: 수동 확인. `checking` → `upToDate` / `checkFailed` / `available`. 찾으면 알림 없이 `markUpdateNotified`만 (R14).
  - 알린 버전은 `loadAppSettings`로 처음에 읽어 ref에 둔다.
- `App.tsx`: `BackgroundProvider` 안쪽에 `UpdaterProvider` (5단계 타이머 확인용으로 TodayProvider 안).

## 확인할 결과
- `npm run build` 성공.
- 개발 모드에서 켜고 10초 넘게 기다려도 GitHub 요청이 없다 (네트워크 기록, R5).
- 순수 함수 (node로 실행):
  - `shouldNotify("0.2.1", "0.2.1")` false, `shouldNotify("0.2.2", "0.2.1")` true, `shouldNotify("0.2.1", null)` true
  - `compareVersions("0.10.0", "0.9.9")` 1
  - `isCheckDue` 23시간 → false, 24시간 → true
  - `progressPercent(42, 100)` 42, `progressPercent(5, null)` null
- 실제 알림은 6단계 설치본에서 확인한다.

## 이 단계에서 만들거나 고칠 파일
- 새 `src/features/updater/api.ts`, `logic.ts`, `notices.ts`, `UpdaterProvider.tsx`
- `src/App.tsx`
