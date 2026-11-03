import type { TaskStatus } from "../../../features/plan/types";

/** 열마다 빈 상태 문구 (R15). 진행 중·완료는 목업 문구 그대로, 시작 전은 목업에 없어 같은 말투로 정했다. */
const EMPTY_LINES: Record<TaskStatus, string[]> = {
  todo: ["오늘 시작할 태스크가 없어요", "플랜에서 오늘 날짜에 태스크를 놓으면 여기 보여요"],
  doing: ["진행 중인 태스크가 없어요", "카드의 ▶로 시작하면 여기로 옮겨져요"],
  done: ["아직 끝낸 태스크가 없어요"],
};

/** 빈 열 점선 상자 */
function ColumnEmpty({ status }: { status: TaskStatus }) {
  const lines = EMPTY_LINES[status];
  return (
    <div className="kanban-empty">
      {lines.map((line, i) => (
        <span key={line}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </div>
  );
}

export default ColumnEmpty;
