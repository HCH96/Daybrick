import type { ReviewDone } from "../../../features/calendar/review";

/** "완료한 태스크" 목록 (목업 review-done, R46). 초록 체크 + 제목 + 오른쪽 완료 시각 */
function ReviewDoneList({ done }: { done: ReviewDone[] }) {
  return (
    <div>
      <div className="cal-review__label">완료한 태스크</div>
      <div className="cal-review__done">
        {done.map((d) => (
          <div key={d.taskId} className="cal-review__done-row">
            <i className="cal-review__check" />
            <span title={d.title}>{d.title}</span>
            <em>{d.time}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewDoneList;
