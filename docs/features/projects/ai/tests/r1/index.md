# 프로젝트 AI 테스트 r1

## 테스트 환경
- 날짜: 2026-11-05 (목), Windows 11, Node v24.20.0, rolldown 1.2.14 (apps/desktop 의존성)
- 대상: apps/desktop 현재 작업 트리 (커밋 86e9728 기준)

## 방법
- 빌드: apps/desktop `npm run build`, apps/desktop/src-tauri `cargo check`
- 순수 함수: 임시 폴더(scratchpad)의 `projects-test.ts`가 features/projects·plan 함수를 직접 불러 실행. `rolldown -c rolldown.config.mjs`로 묶은 뒤 `node projects-test.out.mjs` 실행. `@tauri-apps/api/core`는 가짜 모듈(isTauri=true, invoke=옛 plan.json 문자열)로 바꿔 `loadPlanData`를 실행했다. 확인 75개 중 74개 맞음
- 화면 코드: 판정에 필요한 컴포넌트·훅만 읽음 (앱은 띄우지 않음)

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | 빌드·cargo check | 통과 | [common.md](common.md) |
| A2 | 진행 계산 | 통과 | [detail.md](detail.md) |
| A3 | 주차 계산 | 통과 | [project.md](project.md) |
| A4 | 모닥불 단계 | 통과 | [list.md](list.md) |
| A5 | 마지막 작업일·누적 시간 | 통과 | [detail.md](detail.md) |
| A6 | 잔디 계산 | 통과 | [list.md](list.md) |
| A7 | 자동 완료·재진행 | 통과 | [project.md](project.md) |
| A8 | 옛 plan.json 읽기 | 통과 | [common.md](common.md) |
| A9 | 삭제 규칙 | 통과 | [project.md](project.md) |
| A10 | 태스크 소속 규칙 | 통과 | [link.md](link.md) |
| A11 | 버블 크기 계산 | 실패 | [bubble.md](bubble.md) |
| A12 | 종류 변경 불가·빠른 입력 | 통과 | [project.md](project.md) |
| A13 | 플랜 트리 순서·단계 펼침 | 통과 | [link.md](link.md) |
| A14 | 투데이 묶음 이름·색 | 통과 | [link.md](link.md) |
| A15 | 타이머 상태·갱신 주기 | 통과 | [bubble.md](bubble.md) |

통과 14 · 실패 1

## 실패 항목
- A11: 퍼센트를 하나씩 `Math.round`해서 합이 100이 아닐 때가 있다 (120/300/45분 → 26+65+10=101, 같은 시간 3개 → 33×3=99). 반지름·축소·0분 제외는 맞음. 자세한 내용은 [bubble.md](bubble.md)

## 참고 사항
- `npm run build`는 성공했고 청크 크기(500 kB 넘음) 경고만 나왔다. 이번 기능 때문에 생긴 경고는 아니다.
- R37 문장에는 "합 100"이 직접 적혀 있지 않다. 승인된 예상 결과를 기준으로 실패로 판정했다.
- A3의 "월요일로 맞추기"는 `store.tsx`의 `buildProject`가 export되지 않아서 코드를 읽어 확인했고, 그 안에서 쓰는 `startOfWeek`를 실행해 결과를 확인했다.
- A9를 처음 돌렸을 때 FAIL 1개는 테스트 준비 데이터에 카테고리를 빠뜨린 탓이었다. 고쳐서 다시 돌리니 맞았다 (코드 문제 아님).
