import { useState, type CSSProperties, type ReactNode } from "react";
import Popover from "../../../components/common/Popover";
import { PlusIcon, SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { ChecklistIcon, DateIcon } from "../../../components/icons/PlanIcons";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import { checklistProgress } from "../../../features/plan/selectors";
import { usePlan } from "../../../features/plan/store";
import type { Category, Task, TaskStatus } from "../../../features/plan/types";
import { NONE_GROUP_INFO, projectStageName, taskGroupInfo } from "../../../features/projects/group";
import { activeProjects } from "../../../features/projects/progress";
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
 * 상세 팝업 속성 줄 (목업 popup-props, R35·R37·R39): 카테고리, 상태, 기간, 지원 카드, 체크리스트.
 * 체크리스트 줄은 없으면 `+ 체크리스트`, 있으면 진행도. 항목 목록은 이 아래의 `Checklist`가 그린다.
 * 값을 누르면 고르기 목록이 열린다. 카테고리는 카테고리 색 옅은 칩, 상태는 표시 + 글자.
 */
function PropRows({ task, categories, onOpenApplication }: PropRowsProps) {
  const { state, updateTask, createChecklist } = usePlan();
  const [open, setOpen] = useState<OpenMenu>(null);
  const data = state.kind === "ready" ? state.data : null;

  // 없는 카테고리·단계를 가리키면 미분류로 보여준다 (목록 묶음과 같게). 단계면 프로젝트 색·"프로젝트 › 단계" (프로젝트 R52)
  const info = data ? taskGroupInfo(data, task) : NONE_GROUP_INFO;
  const category = info.kind === "category" ? (categories.find((c) => c.id === task.categoryId) ?? null) : null;
  const projects = data ? activeProjects(data) : [];
  const statusLabel = STATUS_OPTIONS.find((o) => o.status === task.status)?.label ?? "";

  const toggle = (kind: "category" | "status", anchor: HTMLElement) =>
    setOpen((o) => (o?.kind === kind ? null : { kind, anchor }));

  const pickCategory = (id: string | null) => {
    updateTask(task.id, { categoryId: id });
    setOpen(null);
  };
  const pickStage = (stageId: string) => {
    updateTask(task.id, { stageId });
    setOpen(null);
  };
  const pickStatus = (status: TaskStatus) => {
    updateTask(task.id, { status });
    setOpen(null);
  };

  return (
    <div className="task-detail__props">
      <PropRow icon={<ChecklistIcon size={15} />} label="카테고리">
        <button
          type="button"
          className={open?.kind === "category" ? "task-detail__cat task-detail__cat--on" : "task-detail__cat"}
          style={{ "--cat": info.color } as CSSProperties}
          aria-haspopup="menu"
          aria-expanded={open?.kind === "category"}
          onClick={(e) => toggle("category", e.currentTarget)}
        >
          <span className={info.kind === "none" ? "plan-cat-dot plan-cat-dot--ring" : "plan-cat-dot"} />
          {info.name}
        </button>
      </PropRow>

      <PropRow icon={<SmallCheckIcon size={15} />} label="상태">
        <button
          type="button"
          className={open?.kind === "status" ? "task-detail__plain task-detail__plain--on" : "task-detail__plain"}
          aria-haspopup="menu"
          aria-expanded={open?.kind === "status"}
          onClick={(e) => toggle("status", e.currentTarget)}
        >
          <StatusDot status={task.status} size="sm" />
          {statusLabel}
        </button>
      </PropRow>

      <PropRow icon={<DateIcon size={15} />} label="기간">
        <PeriodField
          start={task.start}
          end={task.end}
          onChange={(range) => updateTask(task.id, { start: range?.start ?? null, end: range?.end ?? null })}
        />
      </PropRow>

      <LinkedCardRow task={task} onOpenApplication={onOpenApplication} />

      <PropRow icon={<ChecklistIcon size={15} />} label="체크리스트">
        {task.checklist === null ? (
          <button type="button" className="task-detail__add" onClick={() => createChecklist(task.id)}>
            <PlusIcon size={14} />
            체크리스트
          </button>
        ) : (
          <ChecklistProgressValue task={task} />
        )}
      </PropRow>

      {open?.kind === "category" && (
        <Popover anchor={open.anchor} onClose={() => setOpen(null)} width={210} ariaLabel="카테고리 고르기" className="cat-menu">
          <CategoryOption name="미분류" color={NONE_CATEGORY_COLOR} ring selected={info.kind === "none"} onPick={() => pickCategory(null)} />
          {categories.map((c) => (
            <CategoryOption key={c.id} name={c.name} color={c.color} selected={category?.id === c.id} onPick={() => pickCategory(c.id)} />
          ))}
          {/* 진행 중 프로젝트의 단계 (프로젝트 R52). 고르면 카테고리는 비워진다 (프로젝트 D2) */}
          {projects.some((p) => p.stages.length > 0) && <div className="pop-sep" />}
          {projects.map((p) =>
            p.stages.map((s, index) => (
              <CategoryOption
                key={s.id}
                name={projectStageName(p, index)}
                color={p.color}
                selected={info.kind === "stage" && task.stageId === s.id}
                onPick={() => pickStage(s.id)}
              />
            )),
          )}
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

/** 체크리스트 줄 값: `완료/전체` + 80px 진행 막대 (목업 .mini-prog, R37, D24) */
function ChecklistProgressValue({ task }: { task: Task }) {
  const { done, total } = checklistProgress(task);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <>
      <span className="task-check__count">
        {done}/{total}
      </span>
      <span className="task-check__mini" role="progressbar" aria-label="체크리스트 진행도" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
        <i style={{ width: `${percent}%` }} />
      </span>
    </>
  );
}

interface PropRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

/** 속성 한 줄: 이름 칸(150px) + 값 칸. 마우스를 올린 줄만 옅게 칠한다 (목업 .prop). 지원 카드 줄도 같은 클래스를 쓴다. */
function PropRow({ icon, label, children }: PropRowProps) {
  return (
    <div className="task-detail__prop">
      <span className="task-detail__label">
        {icon}
        {label}
      </span>
      <div className="task-detail__val">{children}</div>
    </div>
  );
}

export default PropRows;
