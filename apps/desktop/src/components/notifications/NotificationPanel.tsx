import { useEffect, useState } from "react";
import { useOpenTarget } from "../../app/pageIntent";
import type { AppNotification } from "../../features/notifications/types";
import { useNotifications } from "../../features/notifications/useNotifications";
import Popover from "../common/Popover";
import NotificationRow from "./NotificationRow";
import PanelEmpty from "./PanelEmpty";
import PanelHead, { type NotificationFilter } from "./PanelHead";
import "./NotificationPanel.css";

const PANEL_WIDTH = 360;
const TICK_MS = 60_000; // 상대 시각을 다시 그리는 간격

interface NotificationPanelProps {
  /** 패널을 연 종 버튼. 패널 오른쪽 끝을 이 버튼에 맞춘다 */
  anchor: HTMLElement;
  onClose: () => void;
}

/** 패널이 열려 있는 동안 1분마다 바뀌는 지금 시각 */
function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

/** 필터에 맞는 행만 고른다. 안 읽음 필터는 확인한 알림을 바로 뺀다 (R19, D18). */
function filterList(list: readonly AppNotification[], filter: NotificationFilter): AppNotification[] {
  if (filter === "all") return [...list];
  return list.filter((n) => n.readAt === null);
}

/**
 * 종 아래로 펼쳐지는 알림 목록 패널 (R6–R20).
 * 바깥 누르기·Esc로 닫는 일은 Popover(useOutsideLayer·useEscapeLayer)가 맡는다.
 * 종 버튼은 anchor라 바깥 누르기로 치지 않고, 종의 클릭이 열고 닫기를 맡는다.
 * 필터는 패널 상태라, 패널이 닫혀 언마운트되면 다시 열 때 "전체"로 시작한다.
 */
function NotificationPanel({ anchor, onClose }: NotificationPanelProps) {
  const { list, unreadCount, markRead, markUnread, markAllRead } = useNotifications();
  const openTarget = useOpenTarget();
  const now = useMinuteClock();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  /** 본문 누르기: 확인 처리하고, 갈 곳으로 이동했으면 패널을 닫는다. 이동하지 못하면 열어 둔다 (R16, R17). */
  const handleOpen = (n: AppNotification) => {
    if (n.readAt === null) markRead(n.id);
    if (n.target && openTarget(n.target)) onClose();
  };

  const visible = filterList(list, filter);

  return (
    <Popover
      anchor={anchor}
      onClose={onClose}
      placement="bottom-end"
      width={PANEL_WIDTH}
      ariaLabel="알림"
      className="notification-panel"
    >
      <PanelHead unreadCount={unreadCount} filter={filter} onFilterChange={setFilter} onMarkAll={markAllRead} />
      <div className="notification-panel__list">
        {visible.length === 0 ? (
          <PanelEmpty filter={filter} />
        ) : (
          visible.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              now={now}
              onMarkRead={markRead}
              onMarkUnread={markUnread}
              onOpen={handleOpen}
            />
          ))
        )}
      </div>
    </Popover>
  );
}

export default NotificationPanel;
