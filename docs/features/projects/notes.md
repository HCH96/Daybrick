# 프로젝트 (projects) 작업 노트
갱신: 2026-11-04

## 완료
- 1단계: 데이터·공용 계산·메뉴 (자동 진행, 최종 테스트 대기)
- 2단계: 목록 카드·만들기·메뉴·완료 묶음 (자동 진행, 최종 테스트 대기)
- 3단계: 상세 머리·진행 판·뒤로가기 (자동 진행, 최종 테스트 대기)
- 4단계: 단계 칸·태스크 줄 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 단계 편집·골인 (`editStages`·`setGoalSeen` → `EditStagesDialog`·`RemoveStageConfirm` → `GoalCelebration`·`useGoalReset`)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D9, D10, D11, D12, D13, D14, D15 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 상세 머리 `단계 편집`/`주차 편집` 버튼은 `DetailHead`의 `onEditStages` prop이 없어 막혀 있다(3단계) — 이걸 연결한다. `ProjectDetail`(props: project·data·clock)이 머리·진행 판·`StageBoard`를 그린다. 만들기 창 부품은 `create/StageListEditor.tsx`·`WeeklyEditor.tsx`·`ColorChoice.tsx`, 클래스는 `create/Create.css`(props만 grep). 깃발 트랙은 `common/FlagTrack.tsx`, 진행 계산은 `features/projects/progress.ts`의 `isProjectDone`·`runnerPosition`.

## 확인할 문서 (경로는 docs/features/projects/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/plan/index.md의 "작은 규칙" 줄 (골인 연출·확인 창 규칙)
- ai/spec/req-project.md
- ai/spec/req-detail.md의 R25 줄
- ai/logs/L07.md
- human/mockups/part-create.html의 create-stage·create-weekly 구역 (CSS: parts.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "새 화면" 표 edit/·GoalCelebration 줄, `StageEdit` 줄, 컴포넌트 구조 App·ProgressPanel 줄
