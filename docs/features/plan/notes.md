# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 1단계: 페이지·주 이동·저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 카테고리 (자동 진행, 최종 테스트 대기)
- 3단계: 태스크 목록 (자동 진행, 최종 테스트 대기)
- 4단계: 상세 팝업 기본 (자동 진행, 최종 테스트 대기)
- 5단계: 주간 달력 표시 (자동 진행, 최종 테스트 대기)
- 6단계: 끌어 놓기 (자동 진행, 최종 테스트 대기)
- 7단계: 지원 일정 표시 (자동 진행, 최종 테스트 대기)
- 8단계: 체크리스트 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 9단계: 지원 카드 연결 (reducer `link-application`·`clear-missing-links`, `useLinkCleanup`, 팝업 `LinkedCardRow`·`CardPickDialog`, 목록 줄 연결 회사)
- 관련 결정: D14, D16, D19, D20, D23, D24, 그 밖 이후 전체 D1–D13, D15, D17–D18, D21–D22 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 속성 줄 "지원 카드"는 `detail/PropRows.tsx`의 기간 줄 아래에 둔다(`task-detail__label`·`task-detail__val`·`task-detail__txt-btn--add`). 목록 줄 연결 회사는 `list/TaskRow.tsx` 아래 줄에서 진행도 `plan-task__prog` 뒤에 붙인다(목업 task-meta .lnk). 지원 상세 팝업은 7단계 `PlanPage`의 `openApplicationId`를 팝업까지 넘겨 쓴다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-09.md
- ai/spec/req-task-detail.md (R39), ai/spec/req-task-list.md (R14)
- ai/logs/L11.md
- human/mockups/part-card-pick.html의 part-card-pick 구역 (CSS: parts.css·common.css에서 클래스 검색)
- human/mockups/popup.html의 popup-props 구역에서 지원 카드 줄만, popup-bare 구역의 `지원 카드 연결` 줄만 (CSS: popup.css에서 card-link·co·st-badge·txt-btn 검색)
- human/mockups/plan.html의 plan-list 구역에서 `lnk` 부분만 (CSS: plan.css에서 `.task-meta .lnk` 검색)
- ai/plan/structure.md의 `useLinkCleanup.ts`·`LinkedCardRow`·`CardPickDialog` 줄 (새 파일 위치를 정할 때만)
