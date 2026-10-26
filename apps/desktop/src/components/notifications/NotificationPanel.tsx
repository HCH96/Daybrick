import { useEffect, useState } from "react";
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

/**
 * 종 아래로 펼쳐지는 알림 목록 패널 (R6–R13, R20).
 * 바깥 누르기·Esc로 닫는 일은 Popover(useOutsideLayer·useEscapeLayer)가 맡는다.
 * 종 버튼은 anchor라 바깥 누르기로 치지 않고, 종의 클릭이 열고 닫기를 맡는다.
 */
function NotificationPanel({ anchor, onClose }: NotificationPanelProps) {
  const { list, unreadCount } = useNotifications();
  const now = useMinuteClock();
  const filter: NotificationFilter = "all"; // 필터 바꾸기는 4단계

  return (
    <Popover
      anchor={anchor}
      onClose={onClose}
      placement="bottom-end"
      width={PANEL_WIDTH}
      ariaLabel="알림"
      className="notification-panel"
    >
      <PanelHead unreadCount={unreadCount} filter={filter} />
      <div className="notification-panel__list">
        {list.length === 0 ? (
          <PanelEmpty filter={filter} />
        ) : (
          list.map((n) => <NotificationRow key={n.id} notification={n} now={now} />)
        )}
      </div>
    </Popover>
  );
}

export default NotificationPanel;
