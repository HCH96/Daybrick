import { useMemo } from "react";
import { useEscapeLayer } from "../../../components/common/useEscapeLayer";
import { CloseIcon } from "../../../components/icons/DialogIcons";
import { ClockIcon } from "../../../components/icons/ServerIcons";
import { useApplications } from "../../../features/applications/store";
import { buildReview, reviewTitle } from "../../../features/calendar/review";
import { useCalendar } from "../../../features/calendar/store";
import { usePlan } from "../../../features/plan/store";
import { useToday } from "../../../features/today/store";
import { useNow } from "../../../features/today/useNow";
import { ItemChip, type CalOpenHandler } from "../chips/CalChip";
import ReviewAddRow from "./ReviewAddRow";
import ReviewDoneList from "./ReviewDoneList";
import ReviewTimeline from "./ReviewTimeline";
import "./Review.css";

interface ReviewPanelProps {
  day: string; // 고른 지난 날짜 "YYYY-MM-DD"
  onClose: () => void;
  onOpen: CalOpenHandler; // 패널 안 칩을 눌렀을 때 (달력 칩과 같은 창, R19·R28)
}

/**
 * 회고 패널 (목업 review-panel, R42–R48). 달력 오른쪽 380px.
 * 머리(날짜 + ✕) / 가운데(하루 종일 · 타임라인 · 완료한 태스크, 여기만 스크롤) / 아래 [+ 개인 일정 추가].
 * 합계·비율은 넣지 않고, 아무것도 없으면 빈 상태 문구 (R47). ✕·Esc로 닫는다 (위에 팝업이 있으면 팝업 먼저).
 */
function ReviewPanel({ day, onClose, onOpen }: ReviewPanelProps) {
  useEscapeLayer(onClose);
  const plan = usePlan().state;
  const applications = useApplications().state;
  const calendar = useCalendar().state;
  const today = useToday().state;
  const todayData = today.kind === "ready" ? today.data : null;
  // 실행 중 타이머가 지난 날에 걸쳐 있을 수 있어 1분마다 다시 계산한다
  const now = useNow(todayData?.running?.state === "running", 60_000);

  const review = useMemo(
    () =>
      buildReview(
        {
          plan: plan.kind === "ready" ? plan.data : null,
          applications: applications.kind === "ready" ? applications.data : null,
          events: calendar.kind === "ready" ? calendar.data.events : [],
          today: todayData,
        },
        day,
        now,
      ),
    [plan, applications, calendar, todayData, day, now],
  );

  const empty = review.allDay.length === 0 && review.timeline.length === 0 && review.done.length === 0;

  return (
    <aside className="cal-review" aria-label="회고">
      <div className="cal-review__head">
        <h2>{reviewTitle(day)}</h2>
        <button type="button" className="cal-icon-btn" onClick={onClose} aria-label="닫기">
          <CloseIcon />
        </button>
      </div>
      <div className="cal-review__body">
        {empty ? (
          <div className="cal-review__empty">
            <ClockIcon size={32} />
            <div>이날은 남은 기록이 없어요</div>
          </div>
        ) : (
          <>
            {review.allDay.length > 0 && (
              <div className="cal-review__allday">
                <span className="cal-review__allday-lbl">하루 종일</span>
                {review.allDay.map((item) => (
                  <ItemChip
                    key={item.key}
                    item={item}
                    className="cal-chip"
                    style={{}}
                    onClick={(e) => onOpen(item, e.currentTarget)}
                  />
                ))}
              </div>
            )}
            {review.timeline.length > 0 && <ReviewTimeline rows={review.timeline} onOpen={onOpen} />}
            {review.done.length > 0 && <ReviewDoneList done={review.done} />}
          </>
        )}
      </div>
      <ReviewAddRow key={day} day={day} />
    </aside>
  );
}

export default ReviewPanel;
