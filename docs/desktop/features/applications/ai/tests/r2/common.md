# r2 · 빌드·코드 규칙·최대화 (A1, A2, A14, A15)

A15(R13, 팝업 묶음)는 이 회차 팝업 항목이 하나뿐이라 여기 합쳤다.

## A1 프런트엔드 빌드
- 테스트 내용: `npm run build`
- 근거 요구사항: 전체
- 수행 방법: `apps/desktop`에서 `npm run build 2>&1 | tail -15`
- 예상 결과: 성공
- 실제 결과: 종료 코드 0, 209 모듈, `✓ built in 194ms`. 경고는 JS 덩어리 500 kB 초과(782 kB) 하나뿐(예전부터 있던 경고)
- 판정: **통과**

## A2 Rust 컴파일 확인
- 테스트 내용: `cargo check`
- 근거 요구사항: step 5
- 수행 방법: `apps/desktop/src-tauri`에서 `cargo check 2>&1 | tail -5`
- 예상 결과: 성공
- 실제 결과: `Finished dev profile … in 0.31s`, 종료 코드 0
- 판정: **통과**

## A14 옛 이름 검색
- 테스트 내용: 옛 속성 id·일정 종류(`deadline`, `applied-date`, `applied`)가 migrate.ts 밖에 남았는지
- 근거 요구사항: step 5
- 수행 방법: `apps/desktop/src`에서 `grep -rn "\"deadline\"\|'deadline'\|applied-date\|appliedDate\|\"applied\"\|kind === \"applied\""` 후 migrate.ts 제외
- 예상 결과: migrate.ts 밖에는 남지 않음
- 실제 결과: `applied-date`·`appliedDate`는 0건. 남은 결과는 모두 옛 데이터 이름이 아님:
  - `types.ts`·`statuses.ts`의 상태 id `"applied"`(지원 완료 상태, 지금도 쓰는 값)
  - `schedule.ts`·`NextEventLabel.tsx`의 표시 종류 `NextItem.kind` `"deadline"`·`"applied"`(카드 문구 구분용 내부 이름)
  - `pages/home/SummaryStrip.tsx`의 요약 칸 id `"deadline"`(홈 "가장 가까운 마감" 칸 이름)
  - 일정 종류 `"applied"`, 속성 id·역할 `deadline`·`appliedDate`는 migrate.ts에만 있음
- 판정: **통과**
- 참고: 내부 이름 `NextItem.kind "deadline"`은 옛 속성과 헷갈릴 수 있다. 바꿀지는 메인 판단.

## A15 최대화 움직임
- 테스트 내용: 최대화 순간에는 왼쪽 위치 전환이 없고, 사이드바를 접고 펼 때만 따라가는지
- 근거 요구사항: R13
- 수행 방법: `components/common/Modal.tsx`(`followSidebar`, `layerClass`), `Modal.css`(`.modal-layer`, `--max`, `--follow`), `AppLayout.css`의 `--overlay-main-left` 읽음
- 예상 결과: 사이드바 펼침일 때 왼쪽 위치에 transition이 걸리지 않음, 사이드바 접고 펼 때는 따라감
- 실제 결과: 기본 `.modal-layer`와 `.modal-layer--max`에는 `transition`이 없다. 최대화하면 `--max`만 붙어 `left: var(--overlay-main-left)`(사이드바 펼침 = 사이드바 너비)로 바로 바뀐다. 두 프레임 뒤에야 `--follow`(`transition: left 0.15s ease`)가 붙어, 그 뒤 사이드바 접기·펴기로 `--overlay-main-left`가 바뀔 때 따라간다. 원래 크기로 돌리면 `followSidebar`를 false로 되돌린다.
- 판정: **통과** (코드 확인만, 화면으로는 보지 않음)
