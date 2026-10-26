# 알림 3단계: 펼침 패널과 알림 행

- 요구사항: R6–R13, R20(빈 상태 문구), R23, R26
- 목업: panel.html (panel-head, panel-list), panel-states.html (states-empty, states-empty-unread)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- `components/common/Popover.tsx`(+css)에 `placement: "bottom-end"`를 추가한다. 오른쪽 끝을 anchor 오른쪽에 맞추고, 기존 placement 동작은 바꾸지 않는다.
- `NotificationPanel.tsx`(+css)를 만든다.
  - 종을 누르면 열리고 다시 누르면 닫힌다 (R6). 바깥을 누르거나 Esc를 눌러도 닫힌다 (R7). 기존 `useOutsideLayer`·`useEscapeLayer`를 쓴다.
  - 너비 360px, 최대 높이는 창 높이의 70%. 머리는 고정하고 목록만 스크롤하며, 스크롤 막대는 얇은 회색 (R8).
  - 패널이 열려 있는 동안 종 버튼 배경을 밝게 한다.
- `PanelHead.tsx`를 만든다 (R9): 1줄은 "알림" 15px 굵게와 "안 읽음 N"(0개면 숨김), 2줄은 [전체 | 안 읽음] 칸 나눔 버튼과 [모두 확인](보라 글자, 두 겹 체크). 이번 단계는 모양만 만들고 동작은 4단계에서 붙인다.
- `NotificationRow.tsx`(+css)를 만든다 (R10–R13, R23).
  - 왼쪽 18px 칸: 주의는 주황 `#F0B860` 경고 삼각형, 정보는 회색 점 8px.
  - 가운데 3줄: "보낸 기능 · 상대 시각" 11px / 제목 13px / 내용 12px 회색. 제목과 내용은 한 줄로 말줄임한다.
  - 오른쪽 28px 버튼 칸: 안 읽음은 ✓, 확인함은 ↺. 버튼 연결은 4단계에서 한다.
  - 안 읽음은 제목을 굵게 하고 보낸 기능 이름을 밝게 한다. 확인함은 왼쪽 표시와 글을 45%로 흐리게 하고 버튼은 흐리지 않는다.
  - 마우스를 올리면 행 배경이 살짝 밝아지고 버튼이 보라 바탕으로 바뀐다.
- `features/notifications/sourceLabel.ts`를 만든다 (R26): PageId면 `PAGE_LABELS`, 아니면 "Daybrick".
- `utils/relativeTime.ts`를 만든다 (R12). 패널이 열려 있는 동안 1분마다 다시 그린다.
- `PanelEmpty.tsx`를 만든다 (R20): 44px 회색 아이콘 상자와 문구. 전체 필터는 종 아이콘과 "새 알림이 없습니다", 안 읽음 필터는 체크 아이콘과 "안 읽은 알림이 없습니다".
- `NotificationIcons.tsx`에 경고 삼각형, 체크, 되돌리기, 두 겹 체크 아이콘을 둔다 (목업 icons.js 모양).

## 확인할 결과
- 목업 panel.html과 같은 배치·색·말줄임으로 보인다.
- 알림 60개를 보내면 50개만 보이고 패널 안에서만 스크롤된다.
- 알림이 없을 때 "새 알림이 없습니다"가 나온다. 안 읽음 문구는 4단계에서 필터를 붙인 뒤 확인한다.
- 종 다시 누르기, 바깥 누르기, Esc로 모두 닫힌다.
- 보낸 기능이 `applications`면 "지원 관리"(PAGE_LABELS 값), 없는 id면 "Daybrick"으로 보인다.
- `npm run build`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `components/common/Popover.tsx`, `Popover.css`
- `components/notifications/NotificationPanel.tsx`, `NotificationPanel.css`, `PanelHead.tsx`, `NotificationRow.tsx`, `NotificationRow.css`, `PanelEmpty.tsx`, `NotificationIcons.tsx`, `NotificationBell.tsx`
- `features/notifications/sourceLabel.ts`, `utils/relativeTime.ts`
