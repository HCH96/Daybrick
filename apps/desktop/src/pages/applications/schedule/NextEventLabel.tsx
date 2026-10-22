import { EVENT_KIND_LABELS } from "../../../features/applications/statuses";
import type { NextItem } from "../../../features/applications/schedule";
import "./NextEventLabel.css";

interface NextEventLabelProps {
  item: NextItem | null;
  /** 남은 일정이 없을 때 흐리게 보여줄 문구. 없으면 아무것도 그리지 않는다 (R24). */
  emptyText?: string;
}

function formatDDay(days: number): string {
  return days === 0 ? "D-day" : `D-${days}`;
}

/** 다음 일정 한 줄: 전형 일정은 보라색 "D-3 코딩테스트", 지원 준비 마감일은 회색 "D-5 마감" */
function NextEventLabel({ item, emptyText }: NextEventLabelProps) {
  if (!item) {
    return emptyText ? <span className="next-event next-event--none">{emptyText}</span> : null;
  }

  const classes = ["next-event"];
  if (item.kind === "deadline") classes.push("next-event--deadline");
  if (item.days <= 1) classes.push("next-event--urgent"); // D-1·당일은 빨간색

  const text =
    item.kind === "event"
      ? `${EVENT_KIND_LABELS[item.event.kind]}${item.event.time ? ` ${item.event.time}` : ""}`
      : "마감";

  return (
    <span className={classes.join(" ")}>
      <b>{formatDDay(item.days)}</b>
      <span className="next-event__text">{text}</span>
    </span>
  );
}

export default NextEventLabel;
