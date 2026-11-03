import { useEffect } from "react";
import Modal from "../../../components/common/Modal";
import { SmallCloseIcon } from "../../../components/icons/CommonIcons";
import { usePlan } from "../../../features/plan/store";
import type { Category } from "../../../features/plan/types";
import type { DatedTask, Period } from "../../../features/today/overdue";
import OverdueRow from "./OverdueRow";
import "./Overdue.css";

interface OverduePopupProps {
  /** 미완료 태스크 (listOverdue 결과, 많이 지난 순) */
  tasks: DatedTask[];
  categories: Category[];
  todayKey: string;
  onClose: () => void;
}

/**
 * 끝내지 못한 태스크 팝업 (R35–R39). 진행 바의 "미완료 N"에서 연다.
 * 줄마다 오늘로 가져오기·다른 날로·완료. 처리한 줄은 목록에서 빠지고, 다 처리하면 닫힌다.
 */
function OverduePopup({ tasks, categories, todayKey, onClose }: OverduePopupProps) {
  const { updateTask } = usePlan();

  // R39: 마지막 줄을 처리하면 팝업을 닫는다 (진행 바 버튼은 N이 0이라 저절로 숨는다)
  const empty = tasks.length === 0;
  useEffect(() => {
    if (empty) onClose();
  }, [empty, onClose]);

  const move = (id: string, period: Period) => updateTask(id, { start: period.start, end: period.end });
  // 완료한 날은 플랜 reducer가 지금으로 적는다 (R38)
  const complete = (id: string) => updateTask(id, { status: "done" });

  return (
    <Modal onClose={onClose} ariaLabel="끝내지 못한 태스크" className="overdue-modal">
      <div className="overdue__head">
        <h3 className="overdue__title">끝내지 못한 태스크</h3>
        <span className="overdue__count">{tasks.length}</span>
        <button type="button" className="overdue__close" aria-label="닫기" onClick={onClose}>
          <SmallCloseIcon size={15} />
        </button>
      </div>
      <div className="overdue__desc">끝일이 지났는데 완료하지 않은 태스크예요. 하나씩 처리하면 목록에서 빠져요.</div>
      <div className="overdue__list">
        {tasks.map((task) => (
          <OverdueRow
            key={task.id}
            task={task}
            category={task.categoryId ? (categories.find((c) => c.id === task.categoryId) ?? null) : null}
            todayKey={todayKey}
            onMove={(period) => move(task.id, period)}
            onComplete={() => complete(task.id)}
          />
        ))}
      </div>
      <div className="overdue__foot">
        <button type="button" className="overdue-btn overdue-btn--ghost" onClick={onClose}>
          닫기
        </button>
      </div>
    </Modal>
  );
}

export default OverduePopup;
