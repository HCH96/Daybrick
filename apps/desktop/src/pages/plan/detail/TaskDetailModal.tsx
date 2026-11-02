import { useEffect, useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Modal from "../../../components/common/Modal";
import { CloseIcon, TrashIcon } from "../../../components/icons/DialogIcons";
import { NoteIcon, TaskIcon } from "../../../components/icons/PlanIcons";
import { usePlan } from "../../../features/plan/store";
import type { Task } from "../../../features/plan/types";
import MarkdownBody from "../../applications/detail/MarkdownBody";
import SaveStateLabel from "../../applications/detail/SaveStateLabel";
import TitleInput from "../../applications/detail/TitleInput";
import Checklist from "./Checklist";
import PropRows from "./PropRows";
import "./TaskDetailModal.css";

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  /** 연결된 지원 카드 이름을 누르면 이 팝업 위에 지원관리 상세 팝업을 연다 (R39, D16) */
  onOpenApplication: (applicationId: string) => void;
}

/**
 * 태스크 상세 팝업 (목업 popup, R35–R41).
 * 머리 "태스크" + 휴지통·닫기, 큰 제목, 속성 줄(카테고리·상태·기간·지원 카드), 체크리스트, 메모, 아래 자동 저장 표시.
 * 고친 내용은 바로 저장소에 들어가 뒤의 목록에도 바로 보인다. 태스크가 사라지면 닫는다.
 */
function TaskDetailModal({ taskId, onClose, onOpenApplication }: TaskDetailModalProps) {
  const { state, saveStatus, updateTask, deleteTask } = usePlan();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const task = state.kind === "ready" ? state.data.tasks.find((t) => t.id === taskId) : undefined;

  useEffect(() => {
    if (!task) onClose();
  }, [task, onClose]);

  if (!task || state.kind !== "ready") return null;
  const name = task.title || "제목 없음";

  return (
    <Modal onClose={onClose} ariaLabel={`${name} 태스크 상세`} className="task-detail">
      <div className="task-detail__head">
        <span className="task-detail__kind">
          <TaskIcon size={14} />
          태스크
        </span>
        <span className="task-detail__tools">
          <button type="button" className="task-detail__btn" title="삭제" aria-label="삭제" onClick={() => setConfirmingDelete(true)}>
            <TrashIcon />
          </button>
          <button type="button" className="task-detail__btn" title="닫기" aria-label="닫기" onClick={onClose}>
            <CloseIcon />
          </button>
        </span>
      </div>

      <div className="task-detail__title">
        <TitleInput value={task.title} onChange={(title) => updateTask(task.id, { title })} />
      </div>
      <PropRows task={task} categories={state.data.categories} onOpenApplication={onOpenApplication} />

      <div className="task-detail__body">
        <Checklist task={task} />
        <div className="task-detail__sec-head">
          <NoteIcon size={15} />
          메모
        </div>
        <div className="task-detail__memo">
          <MarkdownBody key={task.id} initialValue={task.memo} onChange={(memo) => updateTask(task.id, { memo })} />
        </div>
      </div>

      <div className="task-detail__foot">
        <SaveStateLabel status={saveStatus} savedLabel="자동 저장됨" />
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title={`"${name}" 태스크를 지울까요?`}
          message={deleteMessage(task)}
          confirmLabel="삭제"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            deleteTask(task.id);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

/** 삭제 확인 설명: 함께 지워지는 것 (목업 confirm-task) */
function deleteMessage(task: Task): string {
  const count = task.checklist?.length ?? 0;
  return count > 0
    ? `메모와 체크리스트 ${count}개 항목도 함께 지워지고, 되돌릴 수 없어요.`
    : "메모와 체크리스트도 함께 지워지고, 되돌릴 수 없어요.";
}

export default TaskDetailModal;
