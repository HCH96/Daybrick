# 프로젝트 (projects) 작업 노트
갱신: 2026-11-04

## 완료
- 1단계: 데이터·공용 계산·메뉴 (자동 진행, 최종 테스트 대기)
- 2단계: 목록 카드·만들기·메뉴·완료 묶음 (자동 진행, 최종 테스트 대기)
- 3단계: 상세 머리·진행 판·뒤로가기 (자동 진행, 최종 테스트 대기)
- 4단계: 단계 칸·태스크 줄 (자동 진행, 최종 테스트 대기)
- 5단계: 단계 편집·골인 (자동 진행, 최종 테스트 대기)
- 6단계: 주간 투입 버블 (자동 진행, 최종 테스트 대기)
- 7단계: 최근 활동 잔디 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 8단계: 플랜 트리·달력 연동 (`group.ts` → 플랜 트리에 프로젝트·단계 묶음, 단계 태스크 달력 배치·묶음 옮기기, 상세 팝업 "프로젝트 › 단계" 선택)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D9, D10, D11, D12, D13, D14, D15, D16, D17, D18 (ai/spec/decisions.md에서 이 줄만 읽기, 8단계에 직접 쓰이는 건 D2·D5)
- 주의: 목업은 프로젝트 목업에 없고 플랜 목업의 카테고리 묶음 모양을 그대로 쓴다. 고칠 플랜 파일(`pages/plan/list/TaskListPanel.tsx`, `drag/usePlanDrag.ts`·`PlanDragProvider.tsx`·`DragGhost.tsx`, `detail/PropRows.tsx`, `calendar/BarLayer.tsx`)만 통째로 읽고, 카테고리 `GroupHead`·`GroupTasks`·`TaskRow`·`DoneFold`·`InlineTaskInput`은 export·props만 grep. store의 `addStageTask`·`toggleStageFold`·`stageFold`, 단계 칸의 `data-drop-stage`(D15)는 grep으로 확인.

## 확인할 문서 (경로는 docs/features/projects/ 기준, 파일 통째로 읽기)
- ai/plan/step-08.md
- ai/spec/req-link.md (R45–R52 줄)
- ai/logs/L10.md
- ai/plan/structure.md의 "새 화면"·"고칠 파일" 표에서 group.ts·ProjectGroup·StageGroup·플랜 파일 줄 (grep으로 그 줄만)
