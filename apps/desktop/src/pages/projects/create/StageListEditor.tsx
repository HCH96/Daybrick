import { useEffect, useRef, useState } from "react";
import { GripIcon, PlusIcon, SmallCloseIcon } from "../../../components/icons/CommonIcons";
import { moveItem } from "../../../features/plan/reducer";
import { useReorder } from "../../plan/useReorder";

/** 편집 중인 단계 한 줄. key는 화면에서만 쓰는 id */
export interface StageDraft {
  key: string;
  name: string;
}

export function newStageDraft(name = ""): StageDraft {
  return { key: crypto.randomUUID(), name };
}

interface StageListEditorProps {
  items: StageDraft[];
  onChange: (items: StageDraft[]) => void;
}

/**
 * 단계형 단계 목록 (프로젝트 R12, 목업 create-stage): 손잡이·번호·이름·×, 아래 `+ 단계 추가`.
 * 최소 1개라 마지막 한 줄은 지울 수 없다. 이름 칸에서 Enter를 누르면 바로 아래에 새 줄을 넣는다.
 */
function StageListEditor({ items, onChange }: StageListEditorProps) {
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const reorder = useReorder(items.length, (from, to) => onChange(moveItem(items, from, to)));

  useEffect(() => {
    if (focusKey === null) return;
    inputs.current.get(focusKey)?.focus();
    setFocusKey(null);
  }, [focusKey]);

  const insertAt = (index: number) => {
    const draft = newStageDraft();
    onChange([...items.slice(0, index), draft, ...items.slice(index)]);
    setFocusKey(draft.key);
  };

  return (
    <>
      <div className="proj-steps">
        {items.map((item, i) => {
          const classes = ["proj-step"];
          if (reorder.dragIndex === i) classes.push("proj-step--dragging");
          if (reorder.dropGap === i) classes.push("proj-step--drop-before");
          if (reorder.dropGap === items.length && i === items.length - 1) classes.push("proj-step--drop-after");
          return (
            <div key={item.key} ref={reorder.itemRef(i)} className={classes.join(" ")}>
              <span className="proj-step__grip" onPointerDown={reorder.startDrag(i)} aria-label="끌어서 순서 바꾸기">
                <GripIcon size={14} />
              </span>
              <span className="proj-step__no">{i + 1}</span>
              <input
                ref={(el) => {
                  if (el) inputs.current.set(item.key, el);
                  else inputs.current.delete(item.key);
                }}
                className="proj-input proj-step__input"
                value={item.name}
                placeholder="단계 이름"
                aria-label={`${i + 1}번째 단계 이름`}
                onChange={(e) => onChange(items.map((s) => (s.key === item.key ? { ...s, name: e.target.value } : s)))}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
                  e.preventDefault();
                  insertAt(i + 1);
                }}
              />
              <button
                type="button"
                className="proj-icon-btn"
                aria-label={`${i + 1}번째 단계 지우기`}
                disabled={items.length <= 1}
                onClick={() => onChange(items.filter((s) => s.key !== item.key))}
              >
                <SmallCloseIcon size={12} />
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" className="proj-add-step" onClick={() => insertAt(items.length)}>
        <PlusIcon size={12} />
        단계 추가
      </button>
    </>
  );
}

export default StageListEditor;
