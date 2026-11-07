import type { CSSProperties } from "react";
import { useNavigation } from "../../../app/navigation";
import { PlayIcon } from "../../../components/icons/TodayIcons";
import { tasksOnDate } from "../../../features/plan/selectors";
import type { PlanData, Task } from "../../../features/plan/types";
import { taskGroupInfo } from "../../../features/projects/group";
import { sortLikePlanList } from "../../../features/today/kanbanOrder";
import { useToday } from "../../../features/today/store";
import CardState from "../CardState";

interface NowTaskListProps {
  plan: PlanData;
  todayKey: string; // "YYYY-MM-DD"
}

const MAX_ROWS = 3;

/** 오늘이 기간 안인 미완료 태스크를 칸반 순서(진행 중 → 시작 전, 각 열 안은 플랜 목록 순서)로 (R36) */
function openTasksToday(plan: PlanData, todayKey: string): Task[] {
  const ordered = sortLikePlanList(plan, tasksOnDate(plan, todayKey));
  return [...ordered.filter((t) => t.status === "doing"), ...ordered.filter((t) => t.status === "todo")];
}

/**
 * 타이머가 없을 때 (R36–R37): 오늘 미완료 태스크 최대 3개와 줄마다 [▶ 시작].
 * 시작은 투데이와 같은 시작 흐름(requestStart)을 거친다. 첫 줄의 [시작]만 강조한다.
 */
function NowTaskList({ plan, todayKey }: NowTaskListProps) {
  const { requestStart } = useToday();
  const { navigate } = useNavigation();
  const tasks = openTasksToday(plan, todayKey);

  if (tasks.length === 0) {
    return (
      <CardState
        kind="empty"
        linkTo="today"
        message="오늘 할 태스크가 없어요"
        description="플랜에서 오늘 할 일을 정하면 여기서 바로 시작할 수 있어요"
      />
    );
  }

  const rest = tasks.length - MAX_ROWS;
  return (
    <div className="now-tasks">
      {tasks.slice(0, MAX_ROWS).map((task, i) => {
        const title = task.title || "제목 없음";
        const dotStyle = { "--c": taskGroupInfo(plan, task).color } as CSSProperties;
        const doing = task.status === "doing";
        return (
          <div key={task.id} className="now-task">
            <i className="now-dot" style={dotStyle} aria-hidden="true" />
            <span className="now-task__title" title={title}>
              {title}
            </span>
            <span className={doing ? "now-task__status now-task__status--on" : "now-task__status"}>
              {doing ? "진행 중" : "시작 전"}
            </span>
            <button
              type="button"
              className={i === 0 ? "now-btn now-btn--sm now-btn--primary" : "now-btn now-btn--sm"}
              aria-label={`${title} 타이머 시작`}
              onClick={() => requestStart(task.id)}
            >
              <PlayIcon size={12} />
              시작
            </button>
          </div>
        );
      })}
      {rest > 0 && (
        <button type="button" className="now-more" onClick={() => navigate("today")}>
          외 {rest}개 · <b>투데이에서 보기</b>
        </button>
      )}
    </div>
  );
}

export default NowTaskList;
