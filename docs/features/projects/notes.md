# 프로젝트 (projects) 작업 노트
갱신: 2026-11-04

## 완료
- 1단계: 데이터·공용 계산·메뉴 (자동 진행, 최종 테스트 대기)
- 2단계: 목록 카드·만들기·메뉴·완료 묶음 (자동 진행, 최종 테스트 대기)
- 3단계: 상세 머리·진행 판·뒤로가기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 단계 칸·태스크 줄 (`ProjectDetail` 진행 판 아래에 `StageBoard` → 단계 칸·태스크 줄·`+` 입력·칸 사이 끌기)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D9, D10, D11, D12, D13, D14 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `ProjectDetail`(props: project·data·clock)은 맨 바깥 `.proj-detail`(세로 flex, gap 16px, height 100%)에 `--c`를 둔다. 단계 칸은 진행 판 아래에 넣고 남은 높이를 차지하게(flex 1, min-height 0) 한다. 플랜 부품 위치: `pages/plan/StatusDot.tsx`, `pages/plan/list/InlineTaskInput.tsx`, `pages/plan/drag/DragGhost.tsx`, `pages/plan/detail/TaskDetailModal.tsx` (props만 grep). store는 `addStageTask(title, stageId)`가 있다. 현재 단계 자리는 `currentStage(project, tasks, clock.todayKey)`, 주차 기간은 `weekRange`, 칸 이름은 `stageLabel`.

## 확인할 문서 (경로는 docs/features/projects/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-detail.md
- ai/logs/L06.md
- human/mockups/detail.html의 detail-stages 구역, detail-weekly.html의 weekly-stages 구역 (CSS: detail.css에서 클래스 검색)
- ai/plan/structure.md의 "새 화면" 표 detail/StageBoard 줄
