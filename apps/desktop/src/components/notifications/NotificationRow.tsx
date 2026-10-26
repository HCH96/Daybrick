import type { MouseEvent } from "react";
import type { AppNotification } from "../../features/notifications/types";
import { sourceLabel } from "../../features/notifications/sourceLabel";
import { formatRelativeTime } from "../../utils/relativeTime";
import { CheckIcon, UndoIcon, WarnIcon } from "./NotificationIcons";
import "./NotificationRow.css";

interface NotificationRowProps {
  notification: AppNotification;
  /** 상대 시각 기준 (패널이 1분마다 바꾼다) */
  now: Date;
  /** 안 읽음 필터에서 방금 확인해 흐리게 남겨 둔 행 (R19) */
  justRead?: boolean;
  /** ✓ 버튼: 확인 처리 (R14) */
  onMarkRead: (id: string) => void;
  /** ↺ 버튼: 안 읽음으로 되돌리기 (R15) */
  onMarkUnread: (id: string) => void;
  /** 본문 누르기: 확인 처리하고 갈 곳이 있으면 이동 (R16, R17) */
  onOpen: (notification: AppNotification) => void;
}

function rowClassName(unread: boolean, justRead: boolean): string {
  const names = ["notification-row", unread ? "notification-row--unread" : "notification-row--read"];
  if (justRead) names.push("notification-row--just-read");
  return names.join(" ");
}

/**
 * 알림 행 하나 (R11–R15, R23).
 * 왼쪽: 주의는 주황 경고, 정보는 회색 점 / 가운데: 보낸 기능 · 시각, 제목, 내용 / 오른쪽: ✓ 또는 ↺.
 * 행 본문을 누르면 onOpen(확인 + 갈 곳 이동)을 부른다.
 */
function NotificationRow({ notification, now, justRead = false, onMarkRead, onMarkUnread, onOpen }: NotificationRowProps) {
  const unread = notification.readAt === null;
  const time = formatRelativeTime(notification.updatedAt, now);
  const actLabel = unread ? "확인" : "안 읽음으로 되돌리기";

  const handleAct = (e: MouseEvent<HTMLButtonElement>) => {
    // 버튼 누르기가 행 본문 누르기(이동)로 이어지지 않게 한다
    e.stopPropagation();
    if (unread) onMarkRead(notification.id);
    else onMarkUnread(notification.id);
  };

  return (
    <div className={rowClassName(unread, justRead)} onClick={() => onOpen(notification)}>
      <div className="notification-row__lead">
        {notification.importance === "warning" ? (
          <span className="notification-row__warn" role="img" aria-label="주의">
            <WarnIcon />
          </span>
        ) : (
          <span className="notification-row__dot" aria-hidden="true" />
        )}
      </div>
      <div className="notification-row__body">
        <div className="notification-row__meta">
          <b>{sourceLabel(notification.source)}</b> · {time}
        </div>
        <div className="notification-row__title" title={notification.title}>
          {notification.title}
        </div>
        {notification.body && (
          <div className="notification-row__text" title={notification.body}>
            {notification.body}
          </div>
        )}
      </div>
      <button
        type="button"
        className="notification-row__act"
        aria-label={actLabel}
        title={actLabel}
        onClick={handleAct}
      >
        {unread ? <CheckIcon /> : <UndoIcon />}
      </button>
    </div>
  );
}

export default NotificationRow;
