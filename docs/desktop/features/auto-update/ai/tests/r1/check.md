# 새 버전 확인·알림 (req-check, req-compat)

## A5 개발 모드 막기
- 테스트 내용: 개발 모드에서 업데이트를 쓸 수 없다고 알리고, 확인 요청을 보내지 않는지
- 근거 요구사항: R5, R15, D6
- 수행 방법: src-tauri/src/updater/mod.rs `available`·`updater_info`, check.rs `check_update` 읽기
- 예상 결과: `updater_info.available` = `!cfg!(debug_assertions)`, `check_update`는 개발 모드에서 요청 전에 network 오류
- 실제 결과: `available()`이 `!cfg!(debug_assertions)`를 돌려주고 `updater_info`가 그 값을 씀. `check_update` 첫 줄에서 `!available()`이면 `UpdateError::network(...)`로 끝나 `app.updater()?.check()`에 닿지 않음. 프론트 `updaterInfo`도 Tauri 밖이면 available false
- 판정: 통과

## A6 순수 함수 실행
- 테스트 내용: 버전 비교·알림 여부·확인 시점·진행률 함수의 값
- 근거 요구사항: R2, R4, R7, R20
- 수행 방법: 임시 폴더의 a6.mjs로 `node --experimental-strip-types a6.mjs apps/desktop/src/features/updater/logic.ts` 실행 (isCheckDue는 now에서 23·24시간 뺀 값)
- 예상 결과: compareVersions("0.10.0","0.9.9")=1, shouldNotify 세 경우 false/true/true, isCheckDue 23시간 false·24시간 true, progressPercent(42,100)=42 / (5,null)=null
- 실제 결과: 8개 모두 예상과 같음 ("ALL PASS")
- 판정: 통과

## A7 자동 확인
- 테스트 내용: 첫 확인 시점, 주기, 건너뛰기, 실패 처리
- 근거 요구사항: R1, R2, R9, D4
- 수행 방법: features/updater/UpdaterProvider.tsx 상수, 마운트 effect, `autoCheck`, `isBusy` 읽기
- 예상 결과: 마운트 5초 뒤 첫 확인, 1시간마다 isCheckDue, 확인 중·받는 중이면 건너뜀, 자동 확인 실패는 화면 상태를 바꾸지 않고 콘솔만
- 실제 결과: `FIRST_CHECK_DELAY_MS = 5_000`으로 setTimeout, `DUE_POLL_MS = 1시간` setInterval 안에서 `isCheckDue(lastCheckedRef, now)`일 때만 확인 (available false면 타이머를 걸지 않음). `autoCheck`는 시작과 결과 받은 뒤 두 번 `isBusy`(checking·downloading·installing)를 보고 건너뜀. catch에서 `console.warn`만 하고 setPhase 없음
- 판정: 통과

## A8 알림 모양
- 테스트 내용: 새 버전·실패 알림의 칸 값
- 근거 요구사항: R6, R7, R22–R24, D3
- 수행 방법: features/updater/notices.ts `newVersionNotice`, `failureNotice` 읽기
- 예상 결과: source `updater`, kind `update-available`/`update-failed`, 중요도 info/warning, 제목 "새 버전 {v}이 나왔어요", 내용 "설정에서 설치할 수 있어요", target {page:"settings", tab:"app"}, mergeKey `update-available`/`update-failed`
- 실제 결과: 새 버전 알림은 위 값과 모두 같음. 실패 알림은 source `updater`, kind·mergeKey `update-failed`, warning, target 같음, 제목은 설정 줄 실패 문구(network/signature), 내용 "설정에서 다시 설치할 수 있어요"
- 판정: 통과 (내용 문구 "설정에서 설치할 수 있어요"는 새 버전 알림 기준으로 판정)

## A9 수동·자동 확인의 알림 차이
- 테스트 내용: 수동 확인은 알림을 보내지 않고 기록만, 자동 확인은 처음 찾은 버전만 알림
- 근거 요구사항: R7, R14
- 수행 방법: UpdaterProvider.tsx `checkNow`, `autoCheck`, `rememberNotified` 읽기
- 예상 결과: 수동은 notify 없이 markUpdateNotified만, 자동은 shouldNotify일 때만 notify + 기록
- 실제 결과: `checkNow`는 shouldNotify일 때 `rememberNotified`(ref 갱신 + `markUpdateNotified`)만 부르고 notify 없음. `autoCheck`는 shouldNotify일 때 `notify(newVersionNotice)` 뒤 `rememberNotified`
- 판정: 통과

## A10 알린 버전 저장 (mark_update_notified)
- 테스트 내용: 깨진 설정 파일을 덮어쓰지 않고, 옛 파일도 읽히는지
- 근거 요구사항: R33, R36, D5
- 수행 방법: src-tauri/src/background/app_settings.rs `AppSettings`, `read_strict`, `mark_update_notified` 읽기
- 예상 결과: 파일이 있는데 읽기·해석 실패면 쓰지 않고 오류, serde default로 옛 파일도 읽힘
- 실제 결과: `mark_update_notified`가 `read_strict(&app)?`를 써서 파일이 있는데 읽기·JSON 해석에 실패하면 `write` 전에 Err를 돌려줌 (파일이 없을 때만 기본값). `AppSettings`에 `#[serde(rename_all = "camelCase", default)]`가 붙어 `notifiedUpdateVersion`이 없는 옛 파일은 None으로 읽힘
- 판정: 통과 (코드 읽기로만 판정)
