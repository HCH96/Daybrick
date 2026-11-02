import type { TaskStatus } from "../../features/plan/types";
import "./StatusDot.css";

const STATUS_LABEL: Record<TaskStatus, string> = { todo: "시작 전", doing: "진행 중", done: "완료" };

interface StatusDotProps {
  status: TaskStatus;
  /** md: 목록·팝업 (16px), sm: 달력 막대 (13px) */
  size?: "md" | "sm";
  /** 주면 누를 수 있는 버튼이 된다 (R18). 누른 것이 줄 클릭으로 번지지 않게 막는다. */
  onCycle?: () => void;
}

/** 태스크 상태 표시: 시작 전 회색 빈 원, 진행 중 주황 반쪽 원, 완료 초록 채운 원 + 체크 */
function StatusDot({ status, size = "md", onCycle }: StatusDotProps) {
  const className = ["plan-st", `plan-st--${status}`, size === "sm" && "plan-st--sm"].filter(Boolean).join(" ");

  if (!onCycle) return <span className={className} aria-label={STATUS_LABEL[status]} />;

  return (
    <button
      type="button"
      className={`${className} plan-st--btn`}
      aria-label={`상태: ${STATUS_LABEL[status]} (눌러서 바꾸기)`}
      title={STATUS_LABEL[status]}
      onClick={(e) => {
        e.stopPropagation();
        onCycle();
      }}
    />
  );
}

export default StatusDot;
