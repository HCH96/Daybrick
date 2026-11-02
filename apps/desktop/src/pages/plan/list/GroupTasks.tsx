import type { TaskGroup } from "../../../features/plan/selectors";
import { usePlan } from "../../../features/plan/store";
import DoneFold from "./DoneFold";
import InlineTaskInput from "./InlineTaskInput";
import TaskRow from "./TaskRow";

interface GroupTasksProps {
  group: TaskGroup;
  collapsed: boolean;
  /** 머리 `+`로 연 바로 적기 입력칸 (R17) */
  adding: boolean;
  onCloseAdd: () => void;
  /** 태스크 줄을 누르면 상세 팝업을 연다 (R20) */
  onOpenTask: (id: string) => void;
}

/**
 * 묶음 머리 아래: 바로 적기 입력칸, 안 끝난 태스크 줄, "완료 N개" 접힌 줄 (R13–R15·R17).
 * 카테고리 묶음과 미분류 묶음이 같이 쓴다. 접힌 묶음은 아무것도 그리지 않는다.
 */
function GroupTasks({ group, collapsed, adding, onCloseAdd, onOpenTask }: GroupTasksProps) {
  const { addTask } = usePlan();
  if (collapsed) return null;

  return (
    <>
      {adding && (
        <InlineTaskInput onSubmit={(title) => addTask(title, group.category?.id ?? null)} onClose={onCloseAdd} />
      )}
      {group.open.map((task) => (
        <TaskRow key={task.id} task={task} onOpen={onOpenTask} />
      ))}
      <DoneFold tasks={group.done} onOpen={onOpenTask} />
    </>
  );
}

export default GroupTasks;
