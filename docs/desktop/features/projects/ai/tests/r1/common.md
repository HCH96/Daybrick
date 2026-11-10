# 공통: 빌드·저장 파일 호환 (A1, A8)

## A1 빌드·타입 검사·Rust 컴파일
- 테스트 내용: 프론트 빌드(타입 검사 포함)와 Rust 컴파일 확인
- 근거 요구사항: 전체, step-10
- 수행 방법: apps/desktop에서 `npm run build 2>&1 | tail -15`, apps/desktop/src-tauri에서 `cargo check 2>&1 | tail -5`
- 예상 결과: 둘 다 성공, 오류 0
- 실제 결과: `tsc` 통과, vite에서 625개 모듈 변환, `✓ built in 406ms`. 청크 크기 경고(1,479 kB)만 있음. cargo `Finished dev profile`, 오류·경고 없음
- 판정: 통과

## A8 옛 plan.json(projects·stageId 없음) 읽기
- 테스트 내용: 프로젝트 기능 전에 저장된 파일(version 1, `projects` 없음, 태스크에 `stageId` 없음, view에 `stageFold`·`projectsDoneOpen` 없음)을 읽기
- 근거 요구사항: D6, L03 메모
- 수행 방법: features/plan/storage.ts `loadPlanData`·`fillMissing`을 읽음. 임시 스크립트에서 `@tauri-apps/api/core`를 가짜 모듈로 바꾸고 옛 JSON을 넘겨 `loadPlanData()`를 실행했다. 읽은 결과로 `groupTasksByCategory`도 실행
- 예상 결과: 오류 없이 projects: [], stageId: null로 채움
- 실제 결과: 예외 없음. `projects` = [], `tasks[0].stageId` = null, categoryId·카테고리·version 그대로, `view.stageFold` = {}, `projectsDoneOpen` = false. 그룹 계산은 ["cat"]로 정상
- 판정: 통과
