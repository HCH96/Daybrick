import { useState } from "react";
import { ChevronRightIcon } from "../../../components/icons/CommonIcons";
import type { Task } from "../../../features/plan/types";
import TaskRow from "./TaskRow";

interface DoneFoldProps {
  tasks: Task[];
  onOpen?: (id: string) => void;
}

/**
 * 묶음 맨 아래 "완료 N개" 접힌 줄 (R15, D7). 누르면 완료한 태스크가 펼쳐진다.
 * 펼침은 화면 안에서만 기억한다 (저장하지 않음).
 */
function DoneFold({ tasks, onOpen }: DoneFoldProps) {
  const [open, setOpen] = useState(false);
  if (tasks.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={open ? "plan-done-row plan-done-row--open" : "plan-done-row"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronRightIcon size={12} />
        완료 {tasks.length}개
      </button>
      {open && tasks.map((task) => <TaskRow key={task.id} task={task} onOpen={onOpen} />)}
    </>
  );
}

export default DoneFold;
