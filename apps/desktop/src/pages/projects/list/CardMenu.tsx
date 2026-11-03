import { useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Popover from "../../../components/common/Popover";
import { PenIcon } from "../../../components/icons/CommonIcons";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import { DateIcon, FlagIcon } from "../../../components/icons/PlanIcons";
import { usePlan } from "../../../features/plan/store";
import type { Project } from "../../../features/plan/types";
import ColorChoice from "../create/ColorChoice";
import EditStagesDialog from "../edit/EditStagesDialog";
import "../create/Create.css";

interface CardMenuProps {
  anchor: HTMLElement;
  project: Project;
  /** 이 프로젝트 단계에 든 태스크 수 (삭제 확인 문구) */
  taskCount: number;
  onClose: () => void;
  /** 삭제한 뒤 할 일 (상세에서는 목록으로 돌아간다) */
  onDeleted?: () => void;
}

type Phase = "menu" | "edit" | "stages" | "confirm";

/**
 * 카드 `…` 메뉴 (프로젝트 R8·R13·R19, 목업 projects-cards의 .menu).
 * 이름·색 바꾸기 → 작은 팝업 / 단계 편집(주차형은 주차 편집) → 편집 창 / 빨간 프로젝트 삭제 → 확인 창 → 태스크는 미분류로.
 */
function CardMenu({ anchor, project, taskCount, onClose, onDeleted }: CardMenuProps) {
  const { deleteProject } = usePlan();
  const [phase, setPhase] = useState<Phase>("menu");

  if (phase === "edit") return <EditPopover anchor={anchor} project={project} onClose={onClose} />;
  if (phase === "stages") return <EditStagesDialog project={project} onClose={onClose} />;
  if (phase === "confirm") {
    return (
      <ConfirmDialog
        title={`'${project.name}'를 지울까요?`}
        message={`태스크 ${taskCount}개는 미분류로 옮겨집니다.`}
        confirmLabel="프로젝트 삭제"
        onCancel={onClose}
        onConfirm={() => {
          onClose();
          deleteProject(project.id);
          onDeleted?.();
        }}
      />
    );
  }
  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-end" width={176} ariaLabel={`${project.name} 메뉴`} className="proj-menu">
      <button type="button" className="pop-row proj-menu__row" onClick={() => setPhase("edit")} autoFocus>
        <PenIcon />
        이름·색 바꾸기
      </button>
      <button type="button" className="pop-row proj-menu__row" onClick={() => setPhase("stages")}>
        {project.kind === "weekly" ? <DateIcon size={13} /> : <FlagIcon size={13} />}
        {project.kind === "weekly" ? "주차 편집" : "단계 편집"}
      </button>
      <div className="pop-sep" />
      <button type="button" className="pop-row pop-row--danger proj-menu__row" onClick={() => setPhase("confirm")}>
        <TrashIcon />
        프로젝트 삭제
      </button>
    </Popover>
  );
}

interface EditPopoverProps {
  anchor: HTMLElement;
  project: Project;
  onClose: () => void;
}

/** 이름·색 바꾸기 작은 팝업. 빈 이름이면 저장을 막는다. 저장한 색은 최근 쓴 색 맨 앞에 넣는다. */
function EditPopover({ anchor, project, onClose }: EditPopoverProps) {
  const { state, updateProject, pushRecentColor } = usePlan();
  const recentColors = state.kind === "ready" ? state.data.view.recentColors : [];
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState(project.color);
  const trimmed = name.trim();

  const save = () => {
    if (trimmed === "") return;
    updateProject(project.id, { name: trimmed, color });
    pushRecentColor(color);
    onClose();
  };

  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-end" width={320} ariaLabel="이름·색 바꾸기" className="proj-edit">
      <form
        className="proj-edit__body"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <h4 className="proj-edit__title">이름·색 바꾸기</h4>
        <input
          className="proj-input"
          value={name}
          aria-label="프로젝트 이름"
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setName(e.target.value)}
        />
        <ColorChoice value={color} onChange={setColor} recentColors={recentColors} />
        <div className="proj-create__foot">
          <button type="button" className="proj-btn proj-btn--ghost" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="proj-btn proj-btn--primary" disabled={trimmed === ""}>
            저장
          </button>
        </div>
      </form>
    </Popover>
  );
}

export default CardMenu;
