import type { CSSProperties } from "react";
import type { ReviewRow } from "../../../features/calendar/review";
import { ItemChip, type CalOpenHandler } from "../chips/CalChip";

interface ReviewTimelineProps {
  rows: ReviewRow[];
  onOpen: CalOpenHandler;
}

/**
 * 타임라인 (목업 review-timeline, R44–R45). 왼쪽 시각 + 세로선의 점 + 항목.
 * 기록 구간 = 카테고리 색 점 + 색 막대(길이는 시간과 무관, 통계 아님), 일정 = 빈 동그라미 + 칩.
 * 칩은 누르기만 한다 (끌기는 주 줄 칩만, D16).
 */
function ReviewTimeline({ rows, onOpen }: ReviewTimelineProps) {
  return (
    <div className="cal-review__tl">
      {rows.map((row) =>
        row.kind === "rec" ? (
          <div key={row.key} className="cal-review__row" style={{ "--c": row.color } as CSSProperties}>
            <div className="cal-review__time">
              {row.time}
              {row.from && <small>{row.from}</small>}
            </div>
            <div className="cal-review__pin">
              <i />
            </div>
            <div className="cal-review__item">
              <div className="cal-review__rec" title={row.title}>
                <span>{row.title}</span>
              </div>
            </div>
          </div>
        ) : (
          <div key={row.key} className="cal-review__row">
            <div className="cal-review__time">{row.time}</div>
            <div className="cal-review__pin">
              <i className="cal-review__pin-ev" />
            </div>
            <div className="cal-review__item">
              <ItemChip item={row.item} className="cal-chip" style={{}} onClick={(e) => onOpen(row.item, e.currentTarget)} />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export default ReviewTimeline;
