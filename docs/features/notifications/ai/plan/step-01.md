# 알림 수정1 1단계: 같은 시각 정렬

- 요구사항: R10 (영향: R24)
- 목업: panel.html (바뀌지 않음)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정 D17

## 할 일
- `mergeNotification`: 저장할 시각을 `max(now, 목록의 가장 늦은 updatedAt + 1ms)`로 정한다. 새로 만들 때는 `createdAt`·`updatedAt` 둘 다, 합칠 때는 `updatedAt`만 이 값으로 한다.
- `sortForList`: `updatedAt` 최신순, 같으면 `createdAt` 최신순, 그래도 같으면 id 내림차순. 정렬한 뒤 50개를 자른다 (지금처럼).
- 다른 곳(reducer·Provider)은 고치지 않는다. 로컬과 서버 목록을 합쳐 이 함수로 정렬하는 것은 그대로다.

## 확인할 결과
- 알림 파일을 지우고 켠 뒤 `many(60)` → 맨 위 "알림 60", 맨 아래 "알림 11", 배지 `60` (r1 빠른 4번 다시).
- `notifications.json`에서 60개의 `updatedAt`이 모두 다르다.
- 같은 `mergeKey`로 두 번 보내고, 그 사이에 다른 알림을 하나 보내면 합친 알림이 맨 위로 온다 (R24 회귀).
- 앱을 재시작해도 같은 순서.
- `npm run build`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `features/notifications/logic.ts`
