# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 1단계: 페이지·주 이동·저장소 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 카테고리 (카테고리 추가·이름·색 고치기·지우기·순서 바꾸기, 색 선택기, 왼쪽 목록에 묶음 머리)
- 관련 결정: D5, D9, D10, D12, D15, 그 밖 이후 전체 D1–D4, D6–D8, D11, D13, D18 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 저장소는 `features/plan/store.tsx`의 `PlanStore`(state·saveStatus)에 동작 함수를 더하고, `reducer.ts`의 `PlanAction`에 동작을 더한다. id·시각은 store에서 만들어 넣는다 (지원관리 store와 같은 방식). 화면 CSS는 `PlanPage.css`의 `plan-panel`·`plan-list`·`plan-btn` 클래스가 있다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-category.md
- ai/logs/L04.md
- human/mockups/part-list.html의 list-menu·list-catform·list-reorder 구역, part-confirm.html의 confirm-cat 구역, plan.html의 plan-list 구역(묶음 머리만) (CSS: parts.css·plan.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "화면 (`pages/plan/`)" 표 (새 파일 위치를 정할 때만)
