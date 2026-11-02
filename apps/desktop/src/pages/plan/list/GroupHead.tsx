import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronDownIcon, DotsIcon, GripIcon, PlusIcon } from "../../../components/icons/CommonIcons";

interface GroupHeadProps {
  name: string;
  /** 미분류면 true: 테두리만 있는 점, `…` 없음, 끌 수 없음 (R10) */
  fixed?: boolean;
  /** 지금 끌고 있는 머리인지 */
  dragging?: boolean;
  /** `…` 메뉴나 고치기 창이 열려 있는지 (도구 버튼을 계속 보인다) */
  active?: boolean;
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  /** `…` 버튼을 누르면 그 버튼 요소를 넘긴다 (메뉴를 그 옆에 띄우려고) */
  onMenu?: (button: HTMLElement) => void;
}

/**
 * 카테고리 묶음 머리 (목업 plan-list의 g-head): 접기 화살표 자리, 색 점, 이름, 개수 자리, 도구.
 * 색은 부모 요소의 `--cat` 변수를 따른다. `…`·`+`는 마우스를 올렸을 때만 보인다.
 * 접기·개수·`+` 동작은 3단계에서 채운다.
 */
function GroupHead({ name, fixed, dragging, active, onPointerDown, onMenu }: GroupHeadProps) {
  const className = ["plan-ghead", fixed && "plan-ghead--fixed", dragging && "plan-ghead--drag", active && "plan-ghead--active"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} onPointerDown={onPointerDown}>
      <span className="plan-ghead__fold">{dragging ? <GripIcon size={14} /> : <ChevronDownIcon size={14} />}</span>
      <span className={fixed ? "plan-ghead__dot plan-ghead__dot--ring" : "plan-ghead__dot"} />
      <span className="plan-ghead__name">{name}</span>
      <span className="plan-ghead__tools">
        {!fixed && (
          <button
            type="button"
            className="plan-ghead__tool"
            aria-label={`${name} 메뉴`}
            onClick={(e) => onMenu?.(e.currentTarget)}
          >
            <DotsIcon size={14} />
          </button>
        )}
        <button type="button" className="plan-ghead__tool" aria-label={`${name}에 태스크 추가`} disabled>
          <PlusIcon size={14} />
        </button>
      </span>
    </div>
  );
}

export default GroupHead;
