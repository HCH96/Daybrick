# 프로젝트 (projects) 작업 노트
갱신: 2026-11-04

## 완료
- 1단계: 데이터·공용 계산·메뉴 (자동 진행, 최종 테스트 대기)
- 2단계: 목록 카드·만들기·메뉴·완료 묶음 (자동 진행, 최종 테스트 대기)
- 3단계: 상세 머리·진행 판·뒤로가기 (자동 진행, 최종 테스트 대기)
- 4단계: 단계 칸·태스크 줄 (자동 진행, 최종 테스트 대기)
- 5단계: 단계 편집·골인 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 주간 투입 버블 (d3 설치 → `bubbleScale.ts` → 목록 윗줄 틀 + `BubblePanel`·`useBubbleSim`·`BubbleLegend`)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 프로젝트별 이번 주 시간은 `features/projects/useProjectClock.ts`의 `ProjectClock`(`byProject`의 `week`·`runningProjectId`·`todayKey`)에 이미 있다 — export만 grep. 목록 화면은 `ProjectsPage.tsx`가 `list/ProjectList.tsx`를 그린다. 윗줄 왼쪽 60%는 7단계 잔디 자리라 빈 판만 둔다.

## 확인할 문서 (경로는 docs/features/projects/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/plan/index.md의 "작은 규칙" 버블 반지름 줄
- ai/spec/req-bubble.md
- ai/spec/req-list.md의 R2 줄
- ai/spec/visual.md의 버블 표 (grep으로 그 표만)
- ai/logs/L08.md
- human/mockups/projects.html의 projects-top-bubble 구역, part-bubble-empty.html의 bubble-empty 구역 (CSS: projects.css에서 클래스 검색)
- ai/plan/structure.md의 "새 화면" 표 top/·bubbleScale 줄, `BubbleNode` 줄, 컴포넌트 구조 윗줄 줄, `useBubbleSim` 메모 줄
