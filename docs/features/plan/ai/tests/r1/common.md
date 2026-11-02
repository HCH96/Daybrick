# 공통 (빌드·저장)

## A1 프론트엔드 빌드
- 테스트 내용: 타입 검사를 포함한 프론트엔드 빌드
- 근거 요구사항: 전체
- 수행 방법: apps/desktop에서 `npm run build 2>&1 | tail -15`
- 예상 결과: 오류 없이 성공
- 실제 결과: 523개 모듈 변환, `✓ built`. 타입 오류 없음. 묶음 크기 500kB 초과 경고만 있음
- 판정: 통과

## A2 Rust 컴파일, 저장 명령 등록
- 테스트 내용: `cargo check` 성공과 load_plan/save_plan 등록
- 근거 요구사항: R5, D10
- 수행 방법: src-tauri에서 `cargo check`, `grep load_plan|save_plan src-tauri/src`
- 예상 결과: 성공, 두 명령이 등록돼 있음
- 실제 결과: `Finished dev profile`. lib.rs의 핸들러 목록에 `plan::load_plan`, `plan::save_plan`이 있고 plan.rs에 두 함수가 정의돼 있음
- 판정: 통과

## A13 저장 구조와 자동 저장
- 테스트 내용: plan.json 하나에 `view`(접힘·지원 일정 스위치·최근 색) 저장, 0.5초 자동 저장, 팝업을 열기만 하면 "저장 중"이 뜨지 않음
- 근거 요구사항: R5, R12, R33, R41, L07
- 수행 방법:
  - 코드 읽기: src-tauri/src/plan.rs(`PLAN_FILE = "plan.json"`), features/plan/types.ts(`PlanView`), storage.ts(`createEmptyPlanData`), useAutoSave.ts(전체), reducer.ts(`toggle-collapsed`, `set-show-application-events`, `applyTaskPatch`), detail/*.tsx의 useEffect 검색
  - Node 실행: 같은 메모 다시 보내기, 같은 스위치 값, 접힘 토글
- 예상 결과: 코드가 규칙과 맞음
- 실제 결과:
  - 파일 이름 plan.json, `view: { collapsed, showApplicationEvents(기본 true), recentColors }`
  - `SAVE_DELAY_MS = 500`, 바뀔 때마다 타이머를 다시 걸고, 처음 읽은 데이터와 같은 객체면 저장하지 않음. 창 닫기 때 남은 저장을 바로 씀
  - 바뀐 칸이 없는 `update-task`(같은 메모)와 같은 값의 스위치는 같은 데이터 객체를 돌려줌 → 자동 저장 effect가 돌지 않아 "저장 중"이 뜨지 않음. 상세 팝업에 열릴 때 dispatch하는 useEffect 없음
  - 접힘 토글 결과 `view.collapsed = ["none"]`
- 판정: 통과
