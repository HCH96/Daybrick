# 메인 페이지 (main-page) 수정 계획 색인
- 종류: 수정 계획 (근거 기록: L34)
- 대상 R: R12–R15, R17, R22–R47
- 영향받는 R: R4, R16
- 커밋 접두어: 메인 페이지 수정1

- 기능 명세서: [../spec/index.md](../../ai/spec/index.md) · 목업: [../../human/mockups/index.html](../../human/mockups/index.html) 4–6번 (2026-11-07 승인, 목업은 고치지 않음, 계획대로면 차이 없음)
- 작성일: 2026-11-07 · 상태: 승인됨 (2026-11-07), 구현 대기
- 이전 계획 (보관, 모두 구현 완료): [../../archive/plans/](../../archive/plans/) 세 파일
- 경로 기준: `apps/desktop/src/` · 파일 목록·데이터 모양·컴포넌트 구조: [structure.md](structure.md)

## 결정 (계획 중 정함, D9–D11)
- 추천 공고는 홈에 들어올 때마다 한 번 읽고, 머무는 동안 다시 읽지 않는다 (D9).
- 추천 탭을 연 적이 없으면(`recommendOpenedAt` 없음) 새 공고 0개. 홈은 `readOpenedAt()`로 읽기만 한다 (D10).
- 홈 계산은 `features/home/`의 순수 함수에 두고 다른 기능의 함수를 재사용한다. 칸반 순서 함수는 `features/today/kanbanOrder.ts`로 옮겨 같이 쓴다 (D11).
- D2·D4로 옛 카드 3개(오늘 할 일·오늘 일정·오늘 집중 시간)와 `WeeklyFocusEmpty`를 없앤다. 저장 데이터 모양은 바뀌지 않아 옮기기 단계 없음.

### 작은 규칙
- `CardSize = "large" | "narrow" | "quarter"` (7칸×2줄 / 5칸 / 4칸). 1280px 미만이면 모두 6칸.
- 오늘 날짜는 `useTodayKey`(투데이)로 받아 자정에 다시 그린다 (R28). 경과 시간은 `useNow`.
- 추천 탭 이동: `useOpenTarget()({ page: "job-search", tab: "recommend" })`.
- 서버 미연결·로그인 안 됨 = "서버를 연결하면…" 안내, 연결됐는데 읽기 실패 = 못 읽음.
- 순수 함수는 Node로 예시 데이터를 넣어 확인한다. 테스트 도구는 아직 없다.

## 단계
| 단계 | 이름 | 파일 | 요구사항 |
|---|---|---|---|
| 1 | 카드 틀 6개·세 상태 | [step-01.md](step-01.md) | R14–R17 (+R4, R16) |
| 2 | 다가오는 7일 | [step-02.md](step-02.md) | R29–R34 |
| 3 | 상단 빠른 추가·요약 줄 | [step-03.md](step-03.md) | R10–R13, R22–R26, R28 |
| 4 | 지금 하는 것 | [step-04.md](step-04.md) | R35–R37 |
| 5 | 이번 주 집중 | [step-05.md](step-05.md) | R38–R39 |
| 6 | 프로젝트 진행·지원 현황 | [step-06.md](step-06.md) | R40–R42 |
| 7 | 새 추천 공고 | [step-07.md](step-07.md) | R43–R47, R27 |
| 8 | 마무리 | [step-08.md](step-08.md) | 대상 R 전체 |

## 이번 계획에 넣지 않는 것
- scope.md 제외 항목: 카드 고르기, 홈에서 직접 편집, 상세 팝업·특정 날짜로 이동, 제목 표시줄 타이머
- 테스트 도구 도입
