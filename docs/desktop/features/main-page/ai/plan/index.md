# 메인 페이지 (main-page) 수정 계획 색인
- 종류: 수정 계획 (근거 기록: L49)
- 대상 R: R19, R33, R35, R42
- 영향받는 R: R13, R23, R29, R34
- 커밋 접두어: 메인 페이지 수정2

- 기능 명세서: [../spec/index.md](../spec/index.md) · 목업: [../../human/mockups/index.html](../../human/mockups/index.html) 7번 1안, 8번 A안, 9번 T1 (2026-11-09 승인, 목업은 고치지 않음)
- 작성일: 2026-11-09 · 상태: 승인됨 (2026-11-09), 구현 대기
- 근거 기록 L49는 "목업" 항목이다. 바뀐 R은 명세서에 `(L49에서 변경)`으로 표시했다.
- 이전 계획 (보관): [../../archive/plan-home-revamp/](../../archive/plan-home-revamp/) 홈 개편 수정1, 구현·AI 테스트 끝, 사용자 테스트 r1 대기
- 경로 기준: `apps/desktop/src/` · 파일 목록·데이터 모양·컴포넌트 구조: [structure.md](structure.md)

## 결정 (계획 중 정함, D18–D19)
- 타이머 색은 태스크의 카테고리·프로젝트 색(`taskGroupInfo().color`, 미분류는 `--muted`)을 쓰고, 일시정지면 뺀다 (D18).
- 다가오는 7일의 빈 날 합치기는 화면 없는 순수 함수(`features/home/upcoming.ts`)에서 하고, 오늘은 비어도 묶음으로 남긴다 (D19).
- D15(경과 "H:MM:SS")는 그대로 지킨다. 저장 데이터 모양은 바뀌지 않아 옮기기 단계 없음.

### 작은 규칙
- 색은 theme.css 토큰만 쓴다. 프로젝트·카테고리 색은 저장되는 데이터 색이라 인라인 `--tc`로 넘긴다 (design-direction.md 5절 예외).
- 띠는 `box-shadow: inset 3px 0 0 <색>`(옆) / `inset 0 3px 0 <색>`(위). 크기·간격은 4배수, 굵기 700 없음.
- 오늘 집중은 요약 줄과 같은 `dayTotal(today, todayKey, now)`와 `settings.dailyGoalMinutes`를 쓴다. 막대는 100%에서 멈춘다.
- 순수 함수는 Node로 예시 데이터를 넣어 확인한다. 테스트 도구는 아직 없다.

## 단계
| 단계 | 이름 | 파일 | 요구사항 |
|---|---|---|---|
| 1 | 색 A안·지원 현황 칸 | [step-01.md](step-01.md) | R19, R42 (+R13, R23) |
| 2 | 다가오는 7일 계산 | [step-02.md](step-02.md) | R29, R33 |
| 3 | 다가오는 7일 화면 | [step-03.md](step-03.md) | R29–R34 |
| 4 | 지금 하는 것 타이머 | [step-04.md](step-04.md) | R35 |
| 5 | 마무리 | [step-05.md](step-05.md) | 대상 R 전체 |

## 이번 계획에 넣지 않는 것
- 타이머가 없을 때의 목록(R36–R37), 이번 주 집중·프로젝트 진행·새 추천 공고 카드 모양
- 색 B안, 카드 2안, 타이머 T2·T3 (고르지 않은 후보)
- design-direction.md 나누기(171줄), 테스트 도구 도입
