import type { NotificationFilter } from "./PanelHead";
import { CheckIcon, EmptyBellIcon } from "./NotificationIcons";

/** 목록이 비었을 때 (R20). 전체 필터는 종, 안 읽음 필터는 체크 아이콘. */
function PanelEmpty({ filter }: { filter: NotificationFilter }) {
  const unreadOnly = filter === "unread";
  return (
    <div className="notification-panel__empty">
      <div className="notification-panel__empty-icon">
        {unreadOnly ? <CheckIcon /> : <EmptyBellIcon />}
      </div>
      <p>{unreadOnly ? "안 읽은 알림이 없습니다" : "새 알림이 없습니다"}</p>
    </div>
  );
}

export default PanelEmpty;
