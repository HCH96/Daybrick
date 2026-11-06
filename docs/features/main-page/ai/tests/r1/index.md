# main-page AI 테스트 r1 (수정1)

대상: R12–R15, R17, R22–R47 / 영향받는 R4, R16. 수행일 2026-11-07 (토).

## 테스트 환경
- Windows 11 Pro, Node v24.20.0, rolldown v1.2.14 (apps/desktop 의존성)
- PC 시계 2026-11-07 (토) 02:58 무렵, 현지 시간대

## 방법
- 빌드: `npx tsc --noEmit`, `npm run build`, `cargo check`, `npm run tauri build` 실제 실행
- 순수 함수: 임시 폴더에 TS 스크립트를 쓰고 rolldown으로 묶어 `node`로 실행 (44개 검사, 저장소 밖)
- 화면 코드: 판정에 필요한 컴포넌트·CSS만 읽어 확인 (앱·미리보기는 띄우지 않음)

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | 타입 검사·프론트 빌드·cargo check | 통과 | common.md |
| A2 | 설치 파일 빌드 | 통과 | common.md |
| A3 | buildUpcoming | 통과 | upcoming.md |
| A4 | 다가오는 7일 표시·빈 상태 | 통과 | upcoming.md |
| A5 | nextEvent | 통과 | home.md |
| A6 | nearestDeadline | 통과 | home.md |
| A7 | 오늘 집중·오늘 완료·빈 값 문구 | 통과 | home.md |
| A8 | 빠른 추가 | 통과 | home.md |
| A9 | 지금 하는 것 목록·칸반 순서 함수 | 통과 | home-cards.md |
| A10 | 실행 중 카드 | 통과 | home-cards.md |
| A11 | weekFocus | 통과 | home-cards.md |
| A12 | projectRows | 통과 | home-cards.md |
| A13 | newPostings | 통과 | home-cards.md |
| A14 | 추천 공고 읽기·표시 | 통과 | home-cards.md |
| A15 | 저장 함수 호출 범위 | 통과 | home.md |
| A16 | 자정 다시 계산 | 통과 | home.md |
| A17 | 카드 정의·그리드 | 통과 | home.md |
| A18 | 카드 세 상태 | 통과 | home.md |
| A19 | 요약 줄 이동 | 통과 | home.md |
| A20 | 회귀 (스크롤·고정·지원 현황 개수) | 통과 | common.md |

통과 20 · 실패 0

## 실패 항목
없음

## 참고 사항
- `npm run build`에 청크 500kB 초과 경고가 나온다 (이번 수정 전부터 있던 경고, 빌드는 성공).
- A5의 "11/12 (수)"는 형식 예시다. 2026-11-12는 목요일이라 "11/12 (목)"로 나오고, 11/11은 "11/11 (수)"로 나와 형식이 맞음을 확인했다.
- A10·A11의 초 표시·"6시간" 글자는 컴포넌트 안 함수라 같은 식을 스크립트에 옮겨 계산했고, 원래 코드는 읽어서 같은지 확인했다.
- 화면 모양(색, 흐림, 스크롤 동작)은 코드로만 확인했다. 실제 보이는 모습은 사용자 테스트에서 확인해야 한다.
