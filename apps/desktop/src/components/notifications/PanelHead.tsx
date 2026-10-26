import { CheckAllIcon } from "./NotificationIcons";

/** 목록 필터: 전체 / 안 읽음 */
export type NotificationFilter = "all" | "unread";

const FILTERS: readonly { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "unread", label: "안 읽음" },
];

interface PanelHeadProps {
  unreadCount: number;
  filter: NotificationFilter;
}

/**
 * 패널 머리 (R9). 1줄: "알림"과 안 읽은 수(0이면 숨김), 2줄: [전체 | 안 읽음]과 [모두 확인].
 * 필터 바꾸기와 모두 확인 동작은 4단계에서 붙인다.
 */
function PanelHead({ unreadCount, filter }: PanelHeadProps) {
  return (
    <div className="notification-panel__head">
      <div className="notification-panel__title">
        <h3>
          알림
          {unreadCount > 0 && <span className="notification-panel__count">안 읽음 {unreadCount}</span>}
        </h3>
      </div>
      <div className="notification-panel__bar">
        <div className="notification-panel__seg" role="radiogroup" aria-label="알림 필터">
          {FILTERS.map((option) => {
            const selected = option.value === filter;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={
                  selected
                    ? "notification-panel__seg-item notification-panel__seg-item--on"
                    : "notification-panel__seg-item"
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <button type="button" className="notification-panel__mark-all" disabled={unreadCount === 0}>
          <CheckAllIcon />
          모두 확인
        </button>
      </div>
    </div>
  );
}

export default PanelHead;
