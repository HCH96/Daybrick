# 알림 수정1 2단계: 안 읽음 탭 바로 빼기

- 요구사항: R19 (영향: R14, R16, R18, R20)
- 목업: panel-states.html `states-unread`
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정 D18

## 목업과 달라지는 점
- `states-unread`에는 방금 확인한 행이 흐리게(↺) 남아 있다. 이제 그 행은 보이지 않는다. 목업은 고치지 않는다.

## 할 일
- `NotificationPanel`: "방금 확인한 id" 기억(`kept`, `keep`)을 없앤다. 안 읽음 필터는 `readAt === null`인 알림만 보여준다. ✓, 본문 클릭, [모두 확인]은 기억 없이 바로 확인 처리한다.
- `NotificationRow`: `justRead` 속성과 그 클래스를 없앤다. `.notification-row--just-read` 스타일을 지운다.
- 전체 필터의 흐린 표시·↺ 되돌리기는 그대로 둔다 (R13, R15).

## 확인할 결과
- 안 읽음 탭에서 ✓ → 그 행이 바로 사라지고 배지 1 감소, 패널은 열린 채 (r1 빠른 6번 다시, R14).
- 안 읽음 탭에서 마지막 하나를 확인하면 바로 "안 읽은 알림이 없습니다" (R20).
- 안 읽음 탭에서 [모두 확인] → 바로 빈 문구, [모두 확인] 비활성 (R18).
- 안 읽음 탭에서 갈 곳 없는 알림 본문 클릭 → 바로 빠지고 패널 열린 채. 갈 곳 있는 알림은 이동하고 패널이 닫힌다 (R16).
- 전체 탭에서 ✓ → 지금처럼 흐리게 남고 ↺로 되돌아간다. 되돌린 알림은 안 읽음 탭에 다시 보인다.
- `npm run build`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `components/notifications/NotificationPanel.tsx`, `NotificationRow.tsx`, `NotificationRow.css`
