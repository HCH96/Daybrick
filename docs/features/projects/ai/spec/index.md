# 프로젝트 (projects) 명세서 색인

## 기능 개요
처음에 전체 계획을 짜 두고 끝이 있는 태스크 묶음(프로젝트)을 주차나 단계로 나눠 관리하고, 진행 상황을 게임식 연출(깃발 트랙·모닥불·버블)로 보여준다. 태스크는 플랜 태스크와 같은 데이터다.

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 목록 화면·최근 활동 잔디 (+ 화면 구성) | R1–R8, R54–R59 | [req-list.md](req-list.md) |
| 프로젝트·단계 규칙 | R9–R20 | [req-project.md](req-project.md) |
| 상세 화면 (+ 화면 구성) | R21–R34 | [req-detail.md](req-detail.md) |
| 주간 투입 버블 그래프 | R35–R44 | [req-bubble.md](req-bubble.md) |
| 플랜·투데이 연동 | R45–R53 | [req-link.md](req-link.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 프로젝트, 단계, 태스크에 더하는 단계 id, 시간 기록(읽기), 화면 설정 |
| [scope.md](scope.md) | 이번 범위에서 제외하는 것, 나중에 고려할 것 |
| [visual.md](visual.md) | 버블 시안 값, 모닥불 단계, 잔디 연출 값, 목업에서 보고 정할 후보 |
| [extension.md](extension.md) | 확장 구조: 공용 저장소, 주 계산, 시간 합계 계산 |
| [mockup.md](mockup.md) | 목업 경로(2026-11-04 승인)와 목업에서 정한 것 |
| [decisions.md](decisions.md) | 결정 사항 D1–D11 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-11-04 승인). 프로젝트·단계는 plan.json에 함께 두고 파일은 옮기지 않으며(D5–D6), 앱 뒤로가기가 상세도 기억하고 버블은 d3-force를 쓴다(D7–D8)
- 테스트 문서: (아직 없음)
- 진행 기록: [../logs/index.md](../logs/index.md)
- 버블 그래프 시안: 사용자 제공 `bubble.html` (값은 visual.md에 옮겨 둠)
- 태스크 데이터·공용 함수: [플랜 명세서 색인](../../../plan/ai/spec/index.md)의 data.md, extension.md
- 시간 기록·공용 타이머: [투데이 명세서 색인](../../../today/ai/spec/index.md)의 data.md, extension.md
