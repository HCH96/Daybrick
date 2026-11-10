# 오늘 요약 (req-summary)

## A18 streak·monthLights·timelineBars
- 테스트 내용: 스트릭, 이번 달 달력, 타임라인 막대 계산
- 근거 요구사항: R30, R31
- 수행 방법: features/today/stats.ts `dayTotals`·`streak`·`monthLights`·`timelineBars` 실행. 목표 60분, 11/1 70분·11/2 60분·11/3 30분, 오늘 11/3
- 예상 결과: 2일 / 3일 / 08시부터 30분
- 실제 결과: 11/3 30분 → 2일(오늘 미달이라 어제부터), 11/3 90분 → 3일. monthLights 30칸, 1·2일 켜짐, 3일 오늘(꺼짐), 4일부터 future. 07:30~08:30 구간 → 막대 left 0%, 폭 30분(08시 전 부분 잘림)
- 판정: 통과

## A19 하루 목표
- 테스트 내용: 기본값 360분, 입력 검증, 스트릭·트랙이 같은 목표 사용
- 근거 요구사항: R27
- 수행 방법: storage.ts `createEmptyTodayData`, reducer `set-goal`, GoalEditor.tsx `valid` 식(같은 식을 스크립트에서 재현), TodaySummary·StreakTile·RunTrack의 목표 출처 grep
- 예상 결과: 분 60 이상, 합 0분, 24시간 초과 → 저장 불가
- 실제 결과: 기본 360. 검증 6:00 가능, 0:60 불가, 0:00 불가, 24:00 가능, 24:01 불가 (불가면 저장 버튼 disabled·Enter도 무시). reducer도 1~1440으로 자름(5000→1440, 0→1). 스트릭·달력(TodaySummary → StreakTile)과 트랙(RunTrack)·집중 시간 타일 모두 `settings.dailyGoalMinutes` 하나를 읽음
- 판정: 통과

## A20 카테고리별 합계
- 테스트 내용: 카테고리별 합, 지운 태스크 기록은 회색 "미분류"
- 근거 요구사항: R29
- 수행 방법: stats.ts `categoryTotals` 실행 (카테고리 태스크 60분, 지운 태스크 30분, 미분류 태스크 15분), CategoryBars.tsx 색·이름 사용 확인
- 예상 결과: 규칙대로
- 실제 결과: `[c1 "공부" 60분]`, `[null "미분류" #8a8a96 45분]` — 지운 태스크와 미분류가 회색 미분류 한 줄로 합쳐지고 큰 순 정렬
- 판정: 통과
