# 캘린더 AI 테스트 r1

## 테스트 환경
- 날짜: 2026-11-05, Windows 11, Node v24.20.0, rolldown 1.2.14 (apps/desktop/node_modules)
- 기준 커밋: a62a490 (작업 트리 깨끗함)
- 시간대: 순수 함수 실행은 `TZ=Asia/Seoul`

## 방법
- 빌드: `npm run build`, `npx tsc --noEmit` (apps/desktop), `cargo check` (src-tauri)
- 순수 함수: 임시 폴더에 `cal-test.ts`를 쓰고 rolldown으로 묶어 `node`로 실행 (45개 검사, 저장소 밖)
- 화면 코드: 필요한 함수·컴포넌트만 grep·sed로 읽어 확인. 앱·미리보기는 띄우지 않음

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | 빌드·타입 검사·cargo check | 통과 | common.md |
| A2 | 메뉴 교체 | 통과 | page.md |
| A3 | 개인 일정 저장소 | 통과 | personal.md |
| A4 | 월 그리드 함수 | 통과 | page.md |
| A5 | monthLayout | 통과 | page.md |
| A6 | 지원 일정 고르기·배지 | 통과 | chips.md |
| A7 | 깃발 만들기 | 통과 | chips.md |
| A8 | personalForm | 통과 | personal.md |
| A9 | 드래그 옮기기 | 통과 | interaction.md |
| A10 | review.ts | 통과 | review.md |
| A11 | 통계 없음·빈 상태 문구 | 통과 | page.md |
| A12 | 플랜 연동 | 통과 | interaction.md |
| A13 | 바로 반영 | 통과 | page.md |
| A14 | 지원관리 달력 CSS 섞임 | 실패 | common.md |

통과 13 · 실패 1

## 실패 항목
- A14: `CalendarView.css`에 `.cal-view` 밖 전역 선택자가 남아 있다(`.cal`, `.cal-bar*`, `.cal-legend*`, `.cal-ev*`, `.cal-more*`, `.cal-more-pop*`). 반대로 캘린더 `Grid.css`의 전역 `.cal-week`·`.cal-day*` 규칙이 지원관리 달력에도 걸린다(코드로만 확인). 자세한 것은 common.md

## 참고 사항
- 홈 "오늘 일정" 카드 빈 상태 문구와 `SummaryStrip`의 "스케줄러 연결 전"에 한글 "스케줄러"가 남아 있다. R7(카드 내용은 그대로)에 따른 것이라 A2 판정에는 넣지 않았다.
- 빌드는 청크 500kB 넘음 경고만 있고 성공.
- 첫 실행 때 A5 순서 검사 하나가 실패로 나왔는데, 스크립트 기대값을 잘못 적은 것(`null` 대신 `-`)이었다. 고쳐서 다시 돌렸고 코드 결과는 그대로다.
