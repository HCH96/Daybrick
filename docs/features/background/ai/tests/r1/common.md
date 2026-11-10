# r1 · 공통: 빌드·설치본 (A1, A2)

## A1 · 타입 검사·프론트 빌드·Rust 컴파일
- 테스트 내용: `npx tsc --noEmit`, `npm run build`, `cargo check`가 모두 성공하는지
- 근거 요구사항: done.md (완료 조건)
- 수행 방법: apps/desktop에서 `npx tsc --noEmit`, `npm run build`(끝 6줄 확인), apps/desktop/src-tauri에서 `cargo check`(끝 4줄 확인)
- 예상 결과: 모두 성공
- 실제 결과: tsc 오류 출력 없음, `npm run build`는 `✓ built in 401ms`(청크 500kB 넘음 경고만), `cargo check`는 `Finished dev profile`
- 판정: 통과

## A2 · `npm run tauri build` 결과물
- 테스트 내용: 설치본 빌드를 직접 돌려 설치 파일과 실행 파일이 생기는지
- 근거 요구사항: done.md, plan step-05
- 수행 방법: apps/desktop에서 `npm run tauri build`(끝 8줄 확인) 후 `ls -l`로 결과물 크기·시각 확인
- 예상 결과: bundle/에 설치 파일, target/release/daybrick.exe 있음
- 실제 결과: 빌드 성공 ("Finished 2 bundles"). 이번 실행 시각(2026-11-09 21:41)으로 새로 만들어짐
  - bundle/msi/Daybrick_0.1.0_x64_en-US.msi (5.51 MiB)
  - bundle/nsis/Daybrick_0.1.0_x64-setup.exe (4.64 MiB)
  - target/release/daybrick.exe (9.0 MiB)
- 판정: 통과
- 참고: 설치·실행은 하지 않았다 (파일이 있는지만 확인).
