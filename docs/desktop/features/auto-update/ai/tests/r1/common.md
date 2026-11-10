# 공통 (빌드)

## A1 빌드·타입 검사·Rust 컴파일
- 테스트 내용: 프론트 빌드, 타입 검사, Rust 컴파일 확인이 모두 성공하는지
- 근거 요구사항: done.md (완료 기준)
- 수행 방법: apps/desktop에서 `npm run build`, `npx tsc --noEmit`, apps/desktop/src-tauri에서 `cargo check` (출력 끝부분만 확인)
- 예상 결과: 모두 성공
- 실제 결과: `npm run build` "✓ built" 성공(청크 500 kB 초과 경고만 있음), `npx tsc --noEmit` 종료 코드 0·출력 없음, `cargo check` "Finished `dev` profile" 성공. 셋을 묶은 명령의 종료 코드 0
- 판정: 통과
