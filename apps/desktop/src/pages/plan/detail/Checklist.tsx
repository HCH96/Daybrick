import { useCallback, useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import { ChecklistIcon } from "../../../components/icons/PlanIcons";
import { checklistProgress } from "../../../features/plan/selectors";
import { usePlan } from "../../../features/plan/store";
import type { Task } from "../../../features/plan/types";
import { useReorder } from "../useReorder";
import ChecklistItemRow from "./ChecklistItemRow";
import "./Checklist.css";

interface ChecklistProps {
  task: Task;
}

/**
 * 상세 팝업의 체크리스트 (목업 popup-check·popup-bare, R37–R38).
 * 체크리스트가 없으면 `+ 체크리스트` 버튼만. 있으면 머리(진행도 글자·삭제), 진행도 막대, 항목, 아래 `+ 항목 추가`.
 * 항목 글자는 누르면 그 자리에서 고치고, Enter면 바로 아래에 새 항목을 만들어 이어 적는다.
 * 빈 글자로 고치기를 마치면 그 항목은 지운다. 순서는 손잡이를 끌어 바꾼다 (useReorder, D12·D15).
 */
function Checklist({ task }: ChecklistProps) {
  const { createChecklist, deleteChecklist, addCheckItem, updateCheckItem, deleteCheckItem, moveCheckItem } = usePlan();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const items = task.checklist ?? [];
  const taskId = task.id;

  const onMove = useCallback((from: number, to: number) => moveCheckItem(taskId, from, to), [moveCheckItem, taskId]);
  const reorder = useReorder(items.length, onMove);

  if (task.checklist === null) {
    return (
      <div className="task-check__bare">
        <button type="button" className="task-check__create" onClick={() => createChecklist(taskId)}>
          <ChecklistIcon size={13} />+ 체크리스트
        </button>
      </div>
    );
  }

  const { done, total } = checklistProgress(task);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const addAt = (index: number) => {
    const id = addCheckItem(taskId, index);
    if (id) setEditingId(id);
  };

  /** 고치기를 마친다. 빈 글자면 항목을 지우고, 앞뒤 빈칸은 걷어 낸다. */
  const endEdit = (itemId: string, text: string) => {
    setEditingId((current) => (current === itemId ? null : current));
    const trimmed = text.trim();
    if (!trimmed) deleteCheckItem(taskId, itemId);
    else if (trimmed !== text) updateCheckItem(taskId, itemId, { text: trimmed });
  };

  return (
    <div className="task-check">
      <div className="task-detail__sec-head">
        <ChecklistIcon size={15} />
        체크리스트
        {total > 0 && (
          <span className="task-check__count">
            {done}/{total}
          </span>
        )}
        <button
          type="button"
          className="task-detail__txt-btn task-check__remove"
          onClick={() => (items.length > 0 ? setConfirmingDelete(true) : deleteChecklist(taskId))}
        >
          <TrashIcon />
          체크리스트 삭제
        </button>
      </div>
      <div className="task-check__bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
        <i style={{ width: `${percent}%` }} />
      </div>

      {items.map((item, index) => (
        <div key={item.id}>
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
        </div>
      ))}
      {reorder.dropGap === items.length && <div className="task-check__drop-line" />}

      <button type="button" className="task-check__add" onClick={() => addAt(items.length)}>
        <PlusIcon size={15} />
        항목 추가
      </button>

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

export default Checklist;
