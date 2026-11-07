import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { ChevronDownIcon, DotsIcon, GripIcon, PlusIcon } from "../../../components/icons/CommonIcons";

interface GroupHeadProps {
  name: string;
  /** 끝나지 않은 태스크 수 (R12) */
  count: number;
  collapsed: boolean;
  /** 머리를 누르면 접기·펴기 (R12). 도구 버튼을 누른 것은 제외. */
  onToggle: () => void;
  /** `+`: 이 묶음 안에 바로 적기 (R17). 주지 않으면 `+`가 없다 (프로젝트 묶음) */
  onAdd?: () => void;
  /** 바로 적는 입력칸이 열려 있는지 (`+`를 눌린 모양으로) */
  adding?: boolean;
  /** 미분류면 true: 테두리만 있는 점, `…` 없음, 끌 수 없음 (R10) */
  fixed?: boolean;
  /** 지금 끌고 있는 머리인지 */
  dragging?: boolean;
  /** `…` 메뉴나 고치기 창이 열려 있는지 (도구 버튼을 계속 보인다) */
  active?: boolean;
  /** 끌고 있는 태스크 줄을 이 묶음에 놓을 수 있을 때 true: 도구 대신 "여기로 옮기기" 알약 (R45) */
  dropHint?: boolean;
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  /** `…` 버튼을 누르면 그 버튼 요소를 넘긴다 (메뉴를 그 옆에 띄우려고). 주지 않으면 `…`가 없다 */
  onMenu?: (button: HTMLElement) => void;
}

/**
 * 카테고리 묶음 머리 (목업 plan-list의 g-head): 접기 화살표, 색 점, 이름, 안 끝난 개수, 도구.
 * 색은 부모 요소의 `--cat` 변수를 따른다. `…`·`+`는 마우스를 올렸을 때만 보인다.
 */
function GroupHead(props: GroupHeadProps) {
  const { name, count, collapsed, onToggle, onAdd, adding, fixed, dragging, active, dropHint, onPointerDown, onMenu } = props;
  const className = [
    "plan-ghead",
    fixed && "plan-ghead--fixed",
    collapsed && "plan-ghead--closed",
    dragging && "plan-ghead--drag",
    (active || adding) && "plan-ghead--active",
    dropHint && "plan-ghead--drop",
  ]
    .filter(Boolean)
    .join(" ");

  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".plan-ghead__tools")) return;
    onToggle();
  };

  return (
    <div
      className={className}
      onPointerDown={onPointerDown}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-expanded={!collapsed}
      aria-label={`${name} 묶음 ${collapsed ? "펴기" : "접기"}`}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <span className="plan-ghead__fold">{dragging ? <GripIcon size={16} /> : <ChevronDownIcon size={16} />}</span>
      <span className={fixed ? "plan-ghead__dot plan-ghead__dot--ring" : "plan-ghead__dot"} />
      <span className="plan-ghead__name">{name}</span>
      <span className="plan-ghead__count">{count}</span>
      {dropHint && <span className="plan-ghead__drop-hint">여기로 옮기기</span>}
      <span className="plan-ghead__tools">
        {!fixed && onMenu && (
          <button
            type="button"
            className={active ? "plan-ghead__tool plan-ghead__tool--on" : "plan-ghead__tool"}
            aria-label={`${name} 메뉴`}
            onClick={(e) => onMenu(e.currentTarget)}
          >
            <DotsIcon size={16} />
          </button>
        )}
        {onAdd && (
          <button
            type="button"
            className={adding ? "plan-ghead__tool plan-ghead__tool--on" : "plan-ghead__tool"}
            aria-label={`${name}에 태스크 추가`}
            // 입력칸이 열린 채 다시 누르면, 입력칸이 포커스를 잃어 닫혔다가 다시 열리지 않게 한다
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAdd}
          >
            <PlusIcon size={16} />
          </button>
        )}
      </span>
    </div>
  );
}

export default GroupHead;
