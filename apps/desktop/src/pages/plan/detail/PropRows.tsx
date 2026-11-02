import { useState, type CSSProperties, type ReactNode } from "react";
import Popover from "../../../components/common/Popover";
import { ChevronDownIcon, SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { ChecklistIcon, DateIcon } from "../../../components/icons/PlanIcons";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import { usePlan } from "../../../features/plan/store";
import type { Category, Task, TaskStatus } from "../../../features/plan/types";
import CategoryOption from "../CategoryOption";
import StatusDot from "../StatusDot";
import LinkedCardRow from "./LinkedCardRow";
import PeriodField from "./PeriodField";

const STATUS_OPTIONS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "시작 전" },
  { status: "doing", label: "진행 중" },
  { status: "done", label: "완료" },
];

type OpenMenu = { kind: "category" | "status"; anchor: HTMLElement } | null;

interface PropRowsProps {
  task: Task;
  categories: Category[];
  /** 지원 카드 줄의 카드 이름을 누르면 지원관리 상세 팝업을 연다 (D16) */
  onOpenApplication: (applicationId: string) => void;
}

/**
 * 상세 팝업 속성 줄 (목업 popup-props, R35·R39): 카테고리, 상태, 기간, 지원 카드.
 * 칩을 누르면 고르기 목록이 열린다.
 */
function PropRows({ task, categories, onOpenApplication }: PropRowsProps) {
  const { updateTask } = usePlan();
  const [open, setOpen] = useState<OpenMenu>(null);

  // 없는 카테고리를 가리키면 미분류로 보여준다 (목록 묶음과 같게)
  const category = categories.find((c) => c.id === task.categoryId) ?? null;
  const statusLabel = STATUS_OPTIONS.find((o) => o.status === task.status)?.label ?? "";

  const toggle = (kind: "category" | "status", anchor: HTMLElement) =>
    setOpen((o) => (o?.kind === kind ? null : { kind, anchor }));

  const pickCategory = (id: string | null) => {
    updateTask(task.id, { categoryId: id });
    setOpen(null);
  };
  const pickStatus = (status: TaskStatus) => {
    updateTask(task.id, { status });
    setOpen(null);
  };

  return (
    <div className="task-detail__props">
      <PropLabel icon={<ChecklistIcon size={15} />}>카테고리</PropLabel>
      <div className="task-detail__val">
        <button
          type="button"
          className={open?.kind === "category" ? "task-detail__chip task-detail__chip--on" : "task-detail__chip"}
          style={{ "--cat": category?.color ?? NONE_CATEGORY_COLOR } as CSSProperties}
          aria-haspopup="menu"
          aria-expanded={open?.kind === "category"}
          onClick={(e) => toggle("category", e.currentTarget)}
        >
          <span className={category ? "plan-cat-dot" : "plan-cat-dot plan-cat-dot--ring"} />
          {category?.name ?? "미분류"}
          <ChevronDownIcon size={13} />
        </button>
      </div>

      <PropLabel icon={<SmallCheckIcon size={15} />}>상태</PropLabel>
      <div className="task-detail__val">
        <button
          type="button"
          className={open?.kind === "status" ? "task-detail__chip task-detail__chip--on" : "task-detail__chip"}
          aria-haspopup="menu"
          aria-expanded={open?.kind === "status"}
          onClick={(e) => toggle("status", e.currentTarget)}
        >
          <StatusDot status={task.status} />
          {statusLabel}
          <ChevronDownIcon size={13} />
        </button>
      </div>

      <PropLabel icon={<DateIcon size={15} />}>기간</PropLabel>
      <div className="task-detail__val">
        <PeriodField
          start={task.start}
          end={task.end}
          onChange={(range) => updateTask(task.id, { start: range?.start ?? null, end: range?.end ?? null })}
        />
      </div>

      <LinkedCardRow task={task} onOpenApplication={onOpenApplication} />

      {open?.kind === "category" && (
        <Popover anchor={open.anchor} onClose={() => setOpen(null)} width={210} ariaLabel="카테고리 고르기" className="cat-menu">
          <CategoryOption name="미분류" color={NONE_CATEGORY_COLOR} ring selected={category === null} onPick={() => pickCategory(null)} />
          {categories.map((c) => (
            <CategoryOption key={c.id} name={c.name} color={c.color} selected={category?.id === c.id} onPick={() => pickCategory(c.id)} />
          ))}
        </Popover>
      )}
      {open?.kind === "status" && (
        <Popover anchor={open.anchor} onClose={() => setOpen(null)} width={170} ariaLabel="상태 고르기" className="cat-menu">
          {STATUS_OPTIONS.map((o) => {
            const selected = o.status === task.status;
            return (
              <button
                key={o.status}
                type="button"
                className={selected ? "pop-row cat-menu__row pop-row--active" : "pop-row cat-menu__row"}
                onClick={() => pickStatus(o.status)}
                autoFocus={selected}
              >
                <StatusDot status={o.status} />
                <span className="plan-quick__opt-name">{o.label}</span>
                {selected && (
                  <span className="pop-row__check">
                    <SmallCheckIcon size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </Popover>
      )}
    </div>
  );
}

function PropLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="task-detail__label">
      {icon}
      {children}
    </span>
  );
}

export default PropRows;
