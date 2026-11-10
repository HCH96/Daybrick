# 캘린더 데이터

| 데이터 | 항목 | 저장 위치 |
|---|---|---|
| 개인 일정 (새로 만듦) | id, title, start("YYYY-MM-DD"), end, time("HH:mm" 또는 null), createdAt, updatedAt | 새 로컬 파일. 다른 기능과 같은 방식(예: `calendar.json`)이고, 파일 이름은 계획 단계에서 정한다 |
| 태스크 | start·end·status·completedAt·색 (읽기, 날짜만 고침) | plan.json (플랜) |
| 프로젝트 | kind, startWeek, stages, color (읽기) | plan.json |
| 지원 일정 | kind, date, time, 카드 상태·회사 속성 (읽기) | 지원관리 파일 |
| 타이머 기록 | TimeRecord start·end·taskId (읽기) | today.json (투데이) |

- 개인 일정은 하루짜리면 start와 end가 같다. time은 하루짜리일 때만 값을 가진다 (R26).
- 이니셜 배지 색은 저장하지 않고 회사 이름으로 계산한다 (R13).
- 체크포인트 날짜는 저장하지 않고 startWeek와 주차 순서로 계산한다 (R15).
