# 태스크 상세 (req-task-detail)

## A10 기간 보정
- 테스트 내용: 시작일을 끝일보다 뒤로(또는 끝일을 시작일보다 앞으로) 골랐을 때
- 근거 요구사항: R35, D17
- 수행 방법: pages/plan/detail/PeriodField.tsx의 날짜 고르기 계산(파일 끝 함수) 읽기
- 예상 결과: 방금 고르지 않은 쪽을 고른 날로 맞춤
- 실제 결과: 기간이 없으면 고른 날 하루짜리. 시작일을 고를 때 끝일보다 뒤면 끝일도 고른 날로, 끝일을 고를 때 시작일보다 앞이면 시작일도 고른 날로 맞춤
- 판정: 통과

## A14 체크리스트 진행도·Enter·삭제
- 테스트 내용: 진행도 함수, 빈 글자 Enter 동작, 항목 없는 체크리스트 삭제
- 근거 요구사항: R37, R38, L11
- 수행 방법:
  - Node 실행: features/plan/selectors.ts `checklistProgress`
  - 코드 읽기: pages/plan/detail/Checklist.tsx(`endEdit`, 항목의 `onEnter`, 삭제 버튼), ChecklistItemRow.tsx(Enter 처리)
- 예상 결과: 진행도 완료/전체, 빈 글자 Enter면 새 항목 없이 그 항목 지움, 항목 없는 체크리스트는 확인 없이 삭제
- 실제 결과:
  - 3개 중 2개 체크 → `{done: 2, total: 3}`, 체크리스트 없음 → `{0, 0}`
  - Enter: `endEdit`가 공백뿐인 글자면 항목을 지우고, 글자가 있을 때만 다음 자리에 새 항목을 만듦
  - 삭제 버튼: 항목이 있으면 확인 창, 없으면 바로 `deleteChecklist`
- 판정: 통과
