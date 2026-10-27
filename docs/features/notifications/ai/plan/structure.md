# 알림 수정1: 파일 목록과 데이터 모양
전체 구조가 필요할 때만 읽는다. 처음 구조는 [../../archive/plan-initial/structure.md](../../archive/plan-initial/structure.md).

## 1. 고칠 파일 (`apps/desktop/src/`)
| 파일 | 고칠 것 | 단계 |
|---|---|---|
| `features/notifications/logic.ts` | `mergeNotification`: 저장 시각이 목록의 가장 늦은 `updatedAt`보다 늦게. `sortForList`: 보조 기준 추가 | 1 |
| `components/notifications/NotificationPanel.tsx` | `kept`·`keep`("방금 확인" 기억) 제거, 안 읽음 필터는 `readAt === null`만 | 2 |
| `components/notifications/NotificationRow.tsx` | `justRead` 속성 제거 | 2 |
| `components/notifications/NotificationRow.css` | `.notification-row--just-read` 제거 | 2 |

새 파일 없음. Rust·서버 고치지 않음.

## 2. 데이터 모양
바뀌지 않는다 (`NotificationsFile` 그대로). 저장된 `updatedAt`·`createdAt` 값만 겹치지 않게 1ms씩 밀릴 수 있다.

```text
보내기 3번이 같은 ms(10:00:00.000)에 오면
지금:  A 10:00:00.000, B 10:00:00.000, C 10:00:00.000 → 정렬 동률, 저장 순서(A,B,C) 유지
고친 뒤: A 10:00:00.000, B 10:00:00.001, C 10:00:00.002 → C, B, A
```

## 3. 컴포넌트 구조
바뀌지 않는다. `NotificationPanel`은 필터 상태만 들고, `NotificationRow`는 안 읽음·확인함 두 모양만 남는다.

## 4. C++ 비유
- 시각 밀기는 같은 틱에 들어온 이벤트에 일련번호를 붙이는 것과 같다. 정렬 비교 함수(`operator<`)가 동률 없이 전순서가 된다.
- "방금 확인" 기억을 없애는 것은 뷰가 따로 들고 있던 캐시를 지우고, 필터를 상태에서 바로 계산하게 하는 것이다.
