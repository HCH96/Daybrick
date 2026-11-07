import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { GripIcon, SmallCheckIcon, SmallCloseIcon } from "../../../components/icons/CommonIcons";
import type { ChecklistItem } from "../../../features/plan/types";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  /** 글자를 고치는 중이면 입력칸을 보인다 */
  editing: boolean;
  /** 끌고 있는 항목이면 내용을 숨기고 원래 자리를 점선 빈칸으로 (잡은 항목은 Checklist가 따로 띄운다) */
  dragging: boolean;
  rowRef: (el: HTMLElement | null) => void;
  /** 손잡이의 onPointerDown (useReorder) */
  onGripDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onToggle: () => void;
  onStartEdit: () => void;
  onChangeText: (text: string) => void;
  /** 고치기를 마쳤다 (포커스 잃음·Esc). 글자가 비었으면 부르는 쪽에서 항목을 지운다. */
  onEndEdit: (text: string) => void;
  /** Enter: 다음 자리에 새 항목 */
  onEnter: (text: string) => void;
  onDelete: () => void;
}

/**
 * 체크리스트 항목 한 줄 (목업 popup-check의 .ck, R38).
 * 체크 상자, 글자(누르면 그 자리에서 고친다), 마우스를 올리면 왼쪽 끌기 손잡이·오른쪽 ×.
 */
function ChecklistItemRow({
  item,
  editing,
  dragging,
  rowRef,
  onGripDown,
  onToggle,
  onStartEdit,
  onChangeText,
  onEndEdit,
  onEnter,
  onDelete,
}: ChecklistItemRowProps) {
  const className = [
    "task-check__item",
    item.checked && "task-check__item--on",
    editing && "task-check__item--edit",
    dragging && "task-check__item--gap",
  ]
    .filter(Boolean)
    .join(" ");

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 조합 중 Enter·Esc는 조합용
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter(e.currentTarget.value);
    } else if (e.key === "Escape") {
      // 팝업이 닫히지 않게 여기서 멈추고 고치기만 끝낸다
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.blur();
    }
  };

  return (
    <div ref={rowRef} className={className}>
      <span className="task-check__grip" aria-hidden="true" onPointerDown={onGripDown}>
        <GripIcon size={16} />
      </span>
      <button
        type="button"
        className="task-check__box"
        role="checkbox"
        aria-checked={item.checked}
        aria-label={item.text || "빈 항목"}
        onClick={onToggle}
      >
        {item.checked && <SmallCheckIcon size={12} />}
      </button>
      {editing ? (
        <input
          className="task-check__input"
          value={item.text}
          autoFocus
          placeholder="할 일을 적어 보세요"
          aria-label="항목 글자"
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={(e) => onEndEdit(e.currentTarget.value)}
        />
      ) : (
        <span className="task-check__text" onClick={onStartEdit}>
          {item.text}
        </span>
      )}
      {!editing && (
        <button type="button" className="task-check__del" title="항목 지우기" aria-label="항목 지우기" onClick={onDelete}>
          <SmallCloseIcon size={16} />
        </button>
      )}
    </div>
  );
}

export default ChecklistItemRow;
