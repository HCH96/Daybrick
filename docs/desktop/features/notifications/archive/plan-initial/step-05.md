# 알림 5단계: 갈 곳 이동

- 요구사항: R16, R17, R25
- 목업: panel.html (panel-list, 행 클릭 동작만)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙 (D10)

## 할 일
- `app/pageIntent.tsx`를 만든다.
  - `PageIntentProvider`는 맡겨 둔 요청 `{page, tab?, popup?}` 하나를 보관한다.
  - `openTarget(target): boolean`은 `findPage(target.page)`가 없거나 이동할 수 없는 화면이면 false를 돌려준다. 그렇지 않으면 요청을 맡기고 `navigate(page)`한 뒤 true를 돌려준다.
  - `usePageIntent(pageId, handler)`는 화면이 마운트되거나 새 요청이 왔을 때 자기 페이지의 요청을 한 번 꺼내 handler에 넘기고 비운다.
- `App.tsx`에 넣는다. `NavigationContext` 안쪽, `TitleBar`보다 바깥이어야 한다. 단순 제목 표시줄 화면(`FullScreen`)에서는 이동할 수 없는 상태로 둔다.
- 알림 본문을 누르면 확인 처리한다. 갈 곳이 있고 `openTarget`이 true면 패널을 닫는다. false거나 갈 곳이 없으면 확인 처리만 하고 패널을 열어 둔다 (R16, R17).
- 탭·팝업을 실제로 여는 처리는 각 화면이 `usePageIntent`로 한다 (R25). 이번에는 쓰는 화면이 없다.
- `ai/spec/extension.md`의 "갈 곳 처리"를 확정된 방법(`openTarget`/`usePageIntent` 사용법과 예시 3줄)으로 고친다.

## 확인할 결과
- `target:{page:"applications"}` 알림 본문을 누르면 확인 처리되고, 지원 관리 화면으로 이동하고, 패널이 닫힌다. 뒤로 가기로 원래 화면에 돌아온다.
- `target:{page:"nope"}` 알림을 누르면 확인 처리만 되고 패널은 열린 채로 있다.
- 갈 곳이 없는 알림을 누르면 확인 처리만 된다.
- `npm run build`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `app/pageIntent.tsx`, `App.tsx`
- `components/notifications/NotificationRow.tsx`, `NotificationPanel.tsx`
- `docs/desktop/features/notifications/ai/spec/extension.md`
