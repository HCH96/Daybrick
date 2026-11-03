import { tasksOnDate } from "../../../features/plan/selectors";
import type { PlanData, Task, TaskStatus } from "../../../features/plan/types";
import type { RunningTimer } from "../../../features/today/types";
import KanbanColumn from "./KanbanColumn";
import "./Kanban.css";

interface KanbanProps {
  data: PlanData;
  /** 오늘 "YYYY-MM-DD" */
  todayKey: string;
  /** 도는(또는 일시정지한) 타이머, 없으면 null (R11, R48) */
  running: RunningTimer | null;
  /** 카드를 누르면 플랜 태스크 상세 팝업 (R14) */
  onOpenTask: (taskId: string) => void;
}

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

/**
 * 칸반 (R8–R10, R12, R15): 오늘이 기간 안인 태스크를 시작 전 / 진행 중 / 완료 세 열로 나눈다.
 * 날짜 없는 태스크는 tasksOnDate에서 빠진다 (R8). 완료 열은 언제 끝냈든 모두 보인다 (R9).
 */
function Kanban({ data, todayKey, running, onOpenTask }: KanbanProps) {
  const ordered = sortLikePlanList(data, tasksOnDate(data, todayKey));
  const runningTask = running ? data.tasks.find((t) => t.id === running.taskId) : undefined;
  const runningTitle = runningTask ? runningTask.title || "제목 없음" : "지금 도는 태스크";

  return (
    <div className="kanban">
      {STATUSES.map((status) => {
        const tasks = ordered.filter((t) => t.status === status);
        return (
          <KanbanColumn
            key={status}
            status={status}
            tasks={status === "done" ? sortByCompleted(tasks) : tasks}
            categories={data.categories}
            todayKey={todayKey}
            running={running}
            runningTitle={runningTitle}
            onOpenTask={onOpenTask}
          />
        );
      })}
    </div>
  );
}

/** 플랜 목록 순서: 카테고리 순서(미분류·없는 카테고리는 맨 끝) → 태스크 배열 순서 */
function sortLikePlanList(data: PlanData, tasks: Task[]): Task[] {
  const catIndex = new Map(data.categories.map((c, i) => [c.id, i]));
  const taskIndex = new Map(data.tasks.map((t, i) => [t.id, i]));
  const rank = (t: Task) => (t.categoryId !== null ? catIndex.get(t.categoryId) : undefined) ?? data.categories.length;
  return [...tasks].sort((a, b) => rank(a) - rank(b) || (taskIndex.get(a.id) ?? 0) - (taskIndex.get(b.id) ?? 0));
}

/** 완료 열: 완료한 때 최근 순 */
function sortByCompleted(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
}

export default Kanban;
