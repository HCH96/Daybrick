import { useCallback, useEffect, useRef, useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { GripIcon, PlusIcon, SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { usePlan } from "../../../features/plan/store";
import type { ChecklistItem, Task } from "../../../features/plan/types";
import { useReorder } from "../useReorder";
import ChecklistItemRow from "./ChecklistItemRow";
import "./Checklist.css";

interface ChecklistProps {
  task: Task;
}

/**
 * 상세 팝업의 체크리스트 항목 목록 (목업 popup-check, R37–R38).
 * 속성 줄의 "체크리스트" 줄(PropRows) 바로 아래에 값 칸(150px)에 맞춰 들여 쓴다. 체크리스트가 없으면 그리지 않는다.
 * `+ 체크리스트`로 막 만들어지면 빈 항목 하나를 넣고 바로 고치기를 시작한다.
 * 항목 글자는 누르면 그 자리에서 고치고, Enter면 바로 아래에 새 항목을 만들어 이어 적는다.
 * 빈 글자로 고치기를 마치면 그 항목은 지운다. 순서는 손잡이를 끌어 바꾸고, 끄는 동안 잡은 항목이 마우스를 따라온다
 * (useReorder follow, D12·D15). 맨 아래 왼쪽 `항목 추가`, 오른쪽 `체크리스트 삭제`.
 */
function Checklist({ task }: ChecklistProps) {
  const { deleteChecklist, addCheckItem, updateCheckItem, deleteCheckItem, moveCheckItem } = usePlan();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const items = task.checklist ?? [];
  const taskId = task.id;

  const onMove = useCallback((from: number, to: number) => moveCheckItem(taskId, from, to), [moveCheckItem, taskId]);
  const reorder = useReorder(items.length, onMove, { follow: true });

  const addAt = useCallback(
    (index: number) => {
      const id = addCheckItem(taskId, index);
      if (id) setEditingId(id);
    },
    [addCheckItem, taskId],
  );

  // 없던 체크리스트가 방금 만들어졌으면 빈 항목 하나로 시작한다 (R37)
  const hadChecklist = useRef(task.checklist !== null);
  useEffect(() => {
    const has = task.checklist !== null;
    if (has && !hadChecklist.current && task.checklist?.length === 0) addAt(0);
    hadChecklist.current = has;
  }, [task.checklist, addAt]);

  if (task.checklist === null) return null;

  /** 고치기를 마친다. 빈 글자면 항목을 지우고, 앞뒤 빈칸은 걷어 낸다. */
  const endEdit = (itemId: string, text: string) => {
    setEditingId((current) => (current === itemId ? null : current));
    const trimmed = text.trim();
    if (!trimmed) deleteCheckItem(taskId, itemId);
    else if (trimmed !== text) updateCheckItem(taskId, itemId, { text: trimmed });
  };

  return (
    <div className="task-check">
      {items.map((item, index) => (
        <div key={item.id} className="task-check__slot">
          {reorder.dropGap === index && <div className="task-check__drop-line" />}
          <ChecklistItemRow
            item={item}
            editing={editingId === item.id}
            dragging={reorder.dragIndex === index}
            rowRef={reorder.itemRef(index)}
            onGripDown={reorder.startDrag(index)}
            onToggle={() => updateCheckItem(taskId, item.id, { checked: !item.checked })}
            onStartEdit={() => setEditingId(item.id)}
            onChangeText={(text) => updateCheckItem(taskId, item.id, { text })}
            onEndEdit={(text) => endEdit(item.id, text)}
            onEnter={(text) => {
              // 빈 글자에서 Enter면 그 항목만 지우고 멈춘다 (빈 항목이 줄줄이 생기지 않게)
              endEdit(item.id, text);
              if (text.trim()) addAt(index + 1);
            }}
            onDelete={() => deleteCheckItem(taskId, item.id)}
          />
          {reorder.dragIndex === index && reorder.dragOffset && <LiftedItem item={item} offset={reorder.dragOffset} />}
        </div>
      ))}
      {reorder.dropGap === items.length && <div className="task-check__drop-line" />}

      <div className="task-check__foot">
        <button type="button" className="task-check__add" onClick={() => addAt(items.length)}>
          <PlusIcon size={15} />
          항목 추가
        </button>
        <button
          type="button"
          className="task-check__remove"
          onClick={() => (items.length > 0 ? setConfirmingDelete(true) : deleteChecklist(taskId))}
        >
          체크리스트 삭제
        </button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="체크리스트를 지울까요?"
          message={`항목 ${items.length}개가 함께 지워지고, 되돌릴 수 없어요.`}
          confirmLabel="삭제"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            setEditingId(null);
            deleteChecklist(taskId);
          }}
        />
      )}
    </div>
  );
}

/** 끄는 동안 마우스를 따라오는 항목 (목업 .ck.lift). 원래 자리 위에 겹쳐 그리고 포인터 이동량만큼 옮긴다. */
function LiftedItem({ item, offset }: { item: ChecklistItem; offset: { x: number; y: number } }) {
  return (
    <div
      className={item.checked ? "task-check__item task-check__item--lift task-check__item--on" : "task-check__item task-check__item--lift"}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px) rotate(-1.2deg)` }}
      aria-hidden="true"
    >
      <span className="task-check__grip">
        <GripIcon size={14} />
      </span>
      <span className="task-check__box">{item.checked && <SmallCheckIcon size={12} />}</span>
      <span className="task-check__text">{item.text}</span>
    </div>
  );
}

export default Checklist;
