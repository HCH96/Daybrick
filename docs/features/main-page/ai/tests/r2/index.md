# 메인 페이지 AI 테스트 r2 (수정2)

- 날짜: 2026-11-09
- 대상: 계획 "메인 페이지 수정2" (커밋 23da8fd~4c90e40). 대상 R19, R33, R35, R42 · 영향 R13, R23, R29, R34
- 환경: Windows 11, Node v24.20.0, rolldown 1.2.14 (apps/desktop 의존성), cargo (src-tauri)

## 방법
- 빌드: `npm run build`(apps/desktop), `cargo check`(apps/desktop/src-tauri)
- 순수 함수: `features/home/upcoming.ts`를 rolldown으로 임시 폴더에 묶은 뒤 node 스크립트로 `groupUpcoming`·`gapLabel`·`dayParts` 실행 (임시 파일은 저장소 밖)
- 코드 읽기: 홈 다가오는 7일·지금 하는 것·지원 현황 컴포넌트와 CSS, theme.css
- 변경 범위: `git diff 23da8fd~1 HEAD`로 수정2에서 바뀐 줄만 확인. 앱·화면은 띄우지 않음

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | npm run build | 통과 | common.md |
| A2 | cargo check | 통과 | common.md |
| A3 | theme.css 바탕·테두리 A안 값 | 통과 | common.md |
| A4 | 수정2 CSS 토큰·굵기·4배수 | 통과 | common.md |
| A5 | groupUpcoming 예시 1 | 통과 | upcoming.md |
| A6 | groupUpcoming 예시 2 | 통과 | upcoming.md |
| A7 | 빈 날 줄 문구 | 통과 | upcoming.md |
| A8 | dayParts | 통과 | upcoming.md |
| A9 | 7일 모두 빈 상태 | 통과 | upcoming.md |
| A10 | buildUpcoming·UpcomingDay 모양 유지 | 통과 | upcoming.md |
| A11 | 칩 종류 표시 | 통과 | upcoming.md |
| A20 | 칩 → 캘린더, 스크롤·흐림 유지 | 통과 | upcoming.md |
| A12 | 타이머 색·일시정지 | 통과 | home-cards.md |
| A13 | 오늘 집중 = 요약 줄 계산 | 통과 | home-cards.md |
| A14 | 막대 비율 잘림 | 통과 | home-cards.md |
| A15 | H:MM:SS, 1초 갱신 | 통과 | home-cards.md |
| A16 | [중단] title·aria-label | 통과 | home-cards.md |
| A17 | 공용 타이머 저장소 사용 | 통과 | home-cards.md |
| A18 | 지원 현황 계산 유지·칸 모양 | 통과 | home-cards.md |
| A19 | 시계 34/56 규칙 | 통과 | home-cards.md |

통과 20 · 실패 0

## 실패 항목
없음

## 참고 사항
- A14: 하루 목표 0분은 입력에서 1~1440으로 잘려 정상 경로로는 생기지 않는다. 깨진 데이터로 0이 와도 1분으로 보고 계산하므로, 집중이 1분 이상이면 꽉 차고 1분 미만이면 비율대로 보인다(NaN·Infinity 아님). 투데이 RunTrack과 같은 방식이다.
- A19: 규칙(시계 칸 폭 272 미만이면 34)은 코드로 확인했다. 960 창에서 실제로 34로 줄어드는지는 화면을 띄워야 하므로 사용자 테스트에서 확인한다.
- A8: 내일이 토·일이면 "내일" 라벨이 파랑·빨강으로 보인다(L53 메모와 같음). 오늘이 토·일이면 보라가 먼저다.
- 다가오는 7일 칩의 색 인라인 변수 이름은 `--c`다(타이머·지원 현황은 `--tc`). A4 예외와 같은 성격으로 봤다.
- 빌드에 청크 500kB 초과 경고가 있으나 이번 수정과 무관하다.
