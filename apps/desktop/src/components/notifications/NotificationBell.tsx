import { useCallback, useState } from "react";
import { useNotifications } from "../../features/notifications/useNotifications";
import { BellIcon } from "../icons/TitleBarIcons";
import NotificationPanel from "./NotificationPanel";
import "./NotificationBell.css";

/** 배지 글자: 0이면 없음, 100 이상이면 99+ (R3) */
function badgeText(count: number): string | null {
  if (count <= 0) return null;
  return count >= 100 ? "99+" : String(count);
}

/**
 * 제목 표시줄 오른쪽(창 버튼 바로 왼쪽)의 알림 종 버튼.
 * 배지는 저장된 안 읽은 알림 전체 수다 (R2–R4). 서버 연결과 상관없이 로컬 알림만으로 동작한다 (R5).
 * 누르면 아래로 알림 패널을 열고, 다시 누르면 닫는다 (R6). 열린 동안은 눌린 버튼처럼 밝게 둔다.
 * data-tauri-drag-region이 없는 button이라 종을 눌러 끌어도 창이 움직이지 않는다.
 */
function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const badge = badgeText(unreadCount);
  const label = unreadCount > 0 ? `알림 (안 읽음 ${unreadCount}개)` : "알림";
  const className = open
    ? "titlebar__button titlebar__button--pressed notification-bell"
    : "titlebar__button notification-bell";

  return (
    <>
      <button
        ref={setButton}
        type="button"
        className={className}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="알림"
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon />
        {badge && (
          <span className="notification-bell__badge" aria-hidden="true">
            {badge}
          </span>
        )}
      </button>
      {open && button && <NotificationPanel anchor={button} onClose={close} />}
    </>
  );
}

export default NotificationBell;
