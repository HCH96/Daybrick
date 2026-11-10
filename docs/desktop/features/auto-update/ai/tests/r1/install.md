# 받기·설치 (req-install)

## A11 Rust 오류 종류와 받은 바이트 버리기
- 테스트 내용: 오류 분류와 쓸모없어진 바이트를 버리는지
- 근거 요구사항: R22, R23, D2, D6
- 수행 방법: src-tauri/src/updater/mod.rs `From<PluginError> for UpdateError`, check.rs `check_update`, install.rs `download_update`·`install_update`·`discard_update` 읽기
- 예상 결과: 서명 관련 오류 → kind signature + 받은 바이트 버림, 그 밖 network. check_update가 다른 버전·없음이면 버림, install 실패면 버림
- 실제 결과: Minisign·Base64·SignatureUtf8·SignedVersionMismatch·MissingSignedVersion → Signature, 나머지 → Network. `download_update`는 받기 전에 bytes를 None으로 두고 `result?` 실패 시 저장하지 않음(서명 실패 시 바이트 없음). `check_update`는 예전 버전과 새로 찾은 버전이 같을 때만 bytes를 두고, 다르거나 없음이면 None. `install_update`는 `take()`로 꺼낸 뒤 install하므로 실패해도 바이트가 남지 않음
- 판정: 통과

## A12 설치 순서와 [나중에 설치]
- 테스트 내용: 타이머 확인 창·받기·다시 묻기·종료 전 저장·설치 순서
- 근거 요구사항: R16–R21, D2, D7
- 수행 방법: features/updater/UpdaterProvider.tsx `install`, `startDownload`, `afterDownload`, `confirmTimer`, `finishInstall`, `postponeInstall` 읽기
- 예상 결과: 타이머 있으면 확인 창 → 받기 → 이번 흐름에서 동의 안 했고 타이머 있으면 다시 확인 창 → runQuitHandlers → install. [나중에 설치]는 받은 것 버리고 available로
- 실제 결과: `install`은 consent를 false로 두고 타이머가 돌면 확인 창(단계 download), 아니면 바로 받기. 받은 뒤 `afterDownload`가 타이머 있음 && 동의 안 함이면 확인 창(단계 install). `confirmTimer`는 동의를 true로 두고 단계에 따라 받기 또는 `finishInstall`. `finishInstall`은 installing 상태 → `await runQuitHandlers()` → `backend.install()`, 실패면 `fail`. `postponeInstall`은 단계가 install(받은 뒤)이면 `discard()`를 부르고, 어느 단계든 available 상태로 되돌림
- 판정: 통과

## A15 개발 모드 흉내 (daybrickUpdater)
- 테스트 내용: 흉내 도구가 개발 모드에서만 열리고 실제 설치를 부르지 않는지
- 근거 요구사항: D7
- 수행 방법: features/updater/devUpdater.ts `installDevUpdater` 읽기
- 예상 결과: import.meta.env.DEV에서만 열리고 install 명령을 부르지 않음
- 실제 결과: 첫 줄에서 `!import.meta.env.DEV`면 아무것도 하지 않음. 바꿔 끼우는 backend의 install·discard는 console.info만 하고 invoke가 없음 (파일에 `invoke` 사용 없음)
- 판정: 통과
