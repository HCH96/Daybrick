import { useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { usePlan } from "../../../features/plan/store";
import type { Category } from "../../../features/plan/types";
import CategoryForm from "./CategoryForm";
import CategoryMenu from "./CategoryMenu";
import GroupHead from "./GroupHead";

interface CategoryGroupProps {
  category: Category;
  /** 이 카테고리에 든 태스크 수 (삭제 확인 문구에 쓴다) */
  taskCount: number;
  dragging: boolean;
  /** 끌어서 순서 바꾸기를 시작하는 머리의 onPointerDown (useReorder) */
  onDragStart: (e: ReactPointerEvent<HTMLElement>) => void;
  groupRef: (el: HTMLElement | null) => void;
}

/** 열려 있는 작은 창: `…` 메뉴 / 이름·색 고치기 / 삭제 확인 */
type Open = { kind: "menu" | "edit"; anchor: HTMLElement } | { kind: "confirm" } | null;

/**
 * 카테고리 묶음 하나: 머리 + (3단계에서) 그 안의 태스크 줄.
 * 머리 `…`로 이름·색을 고치거나 확인을 받고 지운다 (R8·R9).
 */
function CategoryGroup({ category, taskCount, dragging, onDragStart, groupRef }: CategoryGroupProps) {
  const { deleteCategory } = usePlan();
  const [open, setOpen] = useState<Open>(null);

  const style = { "--cat": category.color } as CSSProperties;

  return (
    <div ref={groupRef} className="plan-group" style={style}>
      <GroupHead
        name={category.name}
        dragging={dragging}
        active={open !== null}
        onPointerDown={onDragStart}
        onMenu={(button) => setOpen({ kind: "menu", anchor: button })}
      />

      {open?.kind === "menu" && (
        <CategoryMenu
          anchor={open.anchor}
          categoryName={category.name}
          onEdit={() => setOpen({ kind: "edit", anchor: open.anchor })}
          onDelete={() => setOpen({ kind: "confirm" })}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === "edit" && <CategoryForm anchor={open.anchor} category={category} onClose={() => setOpen(null)} />}
      {open?.kind === "confirm" && (
        <ConfirmDialog
          title={`"${category.name}" 카테고리를 지울까요?`}
          message={
            taskCount > 0
              ? `안에 있는 태스크 ${taskCount}개는 지워지지 않고 미분류로 옮겨져요.`
              : "안에 있는 태스크는 없어요."
          }
          confirmLabel="카테고리 삭제"
          onCancel={() => setOpen(null)}
          onConfirm={() => {
            setOpen(null);
            deleteCategory(category.id);
          }}
        />
      )}
    </div>
  );
}

export default CategoryGroup;
