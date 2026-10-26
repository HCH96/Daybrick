import type { AppNotification } from "../../features/notifications/types";
import { sourceLabel } from "../../features/notifications/sourceLabel";
import { formatRelativeTime } from "../../utils/relativeTime";
import { CheckIcon, UndoIcon, WarnIcon } from "./NotificationIcons";
import "./NotificationRow.css";

interface NotificationRowProps {
  notification: AppNotification;
  /** 상대 시각 기준 (패널이 1분마다 바꾼다) */
  now: Date;
}

/**
 * 알림 행 하나 (R11–R13, R23).
 * 왼쪽: 주의는 주황 경고, 정보는 회색 점 / 가운데: 보낸 기능 · 시각, 제목, 내용 / 오른쪽: ✓ 또는 ↺.
 * 버튼과 본문 누르기는 4·5단계에서 붙인다.
 */
function NotificationRow({ notification, now }: NotificationRowProps) {
  const unread = notification.readAt === null;
  const time = formatRelativeTime(notification.updatedAt, now);
  const actLabel = unread ? "확인" : "안 읽음으로 되돌리기";

  return (
    <div className={unread ? "notification-row notification-row--unread" : "notification-row notification-row--read"}>
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
      <button type="button" className="notification-row__act" aria-label={actLabel} title={actLabel}>
        {unread ? <CheckIcon /> : <UndoIcon />}
      </button>
    </div>
  );
}

export default NotificationRow;
