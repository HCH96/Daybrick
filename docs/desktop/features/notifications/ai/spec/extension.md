# 알림: 다른 기능이 알림을 보내는 법

알림을 보내는 기능(job-search, 타이머, 폰 앱 연동 등)을 만들 때 이 파일을 읽는다.

## 앱 안에서 보낼 때
- 공용 함수에 R22 항목(보낸 기능, 종류, 중요도, 제목, 내용, 갈 곳, 합치기 키)을 넣어 호출한다.
- 예: 타이머 종료, 폰 앱 연동 끊김.
- 같은 상황이 반복될 수 있는 알림(연결 끊김, 한도 경고 등)은 합치기 키를 넣는다 (R24).

## 서버에서 보낼 때
- 서버 함수가 `notifications` 테이블에 쓴다. 합치기 키가 있으면 같은 키의 안 읽은 알림을 갱신한다 (R29).
- 앱은 켤 때와 실행 중 실시간으로 받는다 (R30–R32).

## 보내는 알림 목록 적기
- 각 기능 명세의 `req-alerts.md`에 표로 적는다: 알림 / 중요도 / 합치기 키 / 누르면.
- 예: job-search R80–R81.

## 갈 곳 처리
- 알림의 갈 곳 `{page, tab?, popup?}`의 `page`는 main-page 페이지 목록(`app/pages.ts`)의 id다. 목록에 없으면 이동하지 않고 확인 처리만 한다 (R17).
- 알림 패널이 본문 누르기에서 `app/pageIntent.tsx`의 `openTarget`(`useOpenTarget()`으로 얻음)을 불러 요청을 맡기고 그 페이지로 이동한다. `navigate`는 고치지 않는다 (D10).
- 탭·팝업을 실제로 여는 화면은 페이지 컴포넌트에서 `usePageIntent(페이지 id, handler)`를 한 번 부른다. 화면이 마운트되거나 새 요청이 오면 자기 요청을 한 번 꺼내 넘겨준다. 예:
  ```tsx
  usePageIntent("applications", (intent) => {
    if (intent.tab) setTab(intent.tab);
    if (intent.popup) openPopup(intent.popup);
  });
  ```
- 연결 마법사 등 전체 화면에서는 이동할 수 없어(Provider 없음) 확인 처리만 한다.
