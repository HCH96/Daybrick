# 공통 (빌드·데이터 모양)

## A1 빌드·타입 검사·Rust 컴파일
- 테스트 내용: 프론트엔드 빌드, 타입 검사, Rust 컴파일 확인
- 근거 요구사항: 전체
- 수행 방법: apps/desktop에서 `npm run build | tail`, `npx tsc --noEmit | tail`, apps/desktop/src-tauri에서 `cargo check | tail`
- 예상 결과: 모두 성공
- 실제 결과: build 종료 코드 0 ("built in 367ms", 청크 크기 경고만), tsc 0 (오류 없음), cargo check 0 ("Finished dev profile")
- 판정: 통과

## A22 today.json 모양
- 테스트 내용: 저장 데이터가 계획의 모양 `{"version":1,"records":[{id,taskId,start,end}],"running":…,"settings":{"dailyGoalMinutes":360}}`과 같은가
- 근거 요구사항: D8
- 수행 방법: features/today/types.ts(TodayData·TimeRecord·RunningTimer), storage.ts(createEmptyTodayData, 읽기 검사, `JSON.stringify(data)` 저장), src-tauri/src/today.rs(파일 이름 today.json) 읽기. 스크립트로 빈 데이터 → start → finish 뒤 키 목록 확인
- 예상 결과: 최상위 키 version·records·running·settings, 기록 키 id·taskId·start·end, settings.dailyGoalMinutes 360
- 실제 결과: 최상위 키 `["version","records","running","settings"]`, version 1, 기록 키 `["id","taskId","start","end"]`, settings `{"dailyGoalMinutes":360}`. running은 `{taskId,state,segments,lastSeenAt}` 또는 null. 저장은 Rust `save_today`가 today.json에 씀 (임시 파일 뒤 교체)
- 판정: 통과
