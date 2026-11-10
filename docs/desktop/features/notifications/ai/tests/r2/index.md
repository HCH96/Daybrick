# 알림 AI 테스트 r2 (수정1 회차)

대상: R10(같은 시각 정렬), R19(안 읽음 탭 바로 빼기) / 영향: R14·R16·R18·R20·R24

## 테스트 환경
- 날짜: 2026-10-27, Windows 11, Node v24.20.0 (타입 지우기로 .ts 직접 실행)
- 대상 코드: apps/desktop 현재 작업 트리 (커밋 c026636 기준)

## 방법
- A1: apps/desktop에서 `npm run build` 실행
- A2–A7: `features/notifications/logic.ts`를 임시 폴더에 복사해 검사 스크립트(run.ts)로 순수 함수 실행. 필터는 패널의 `filterList`와 같은 식을 스크립트에 옮겨 확인
- A6–A8: 패널 컴포넌트(NotificationPanel·PanelHead·PanelEmpty)와 Provider·reducer 코드 읽기
- 앱·미리보기는 띄우지 않음 (화면 동작은 사용자 테스트에서 확인)

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | `npm run build` | 통과 | common.md |
| A2 | 같은 ms 로컬 알림 60개 시각 | 통과 | panel.md |
| A3 | sortForList 정렬·50개 자르기 | 통과 | panel.md |
| A4 | 합치기 회귀 (R24) | 통과 | panel.md |
| A5 | 서버 알림 시각 유지·보조 정렬 | 통과 | panel.md |
| A6 | 필터 계산 (안 읽음/전체) | 통과 | panel.md |
| A7 | 빈 문구·[모두 확인] 비활성 | 통과 | panel.md |
| A8 | 본문 클릭 이동·패널 닫기 | 통과 | panel.md |

통과 8 · 실패 0

## 실패 항목
없음

## 참고 사항
- A1: 빌드 성공. vite의 "청크 500kB 초과" 경고는 기존과 같음 (이번 수정과 무관)
- A5: 스크립트에서 처음 적은 기대 순서가 틀려 한 번 "NG"가 나왔으나, 로컬 알림의 createdAt이 서버 알림보다 늦어 맨 위에 오는 것이 R10 규칙대로라 기대값 쪽 오류로 판단. 서버 알림끼리의 순서와 시각 유지는 기대대로임 (panel.md A5 참고)
- 로컬 시각 보정(D17)은 로컬 목록만 보고 잡는다. 서버 알림과 같은 ms가 겹치면 보조 기준(createdAt → id)으로 정해지며, 이는 R10 범위 안의 동작임
