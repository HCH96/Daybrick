import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOverlayRoot } from "../../../components/layout/overlayRoot";
import { useDialogFocus } from "../../../components/common/useDialogFocus";
import { useEscapeLayer } from "../../../components/common/useEscapeLayer";
import { KEEP_POPOVERS_ATTR } from "../../../components/common/useOutsideLayer";
import "../../../components/common/ConfirmDialog.css";
import "../create/Create.css";

/** 옮길 수 있는 단계 (편집 뒤 남는 단계) */
export interface StageTarget {
  id: string;
  label: string;
}

interface RemoveStageConfirmProps {
  /** 없어지는 단계 이름 (주차형 빈 이름은 "N주차"로 넘긴다) */
  stageLabel: string;
  taskCount: number;
  targets: StageTarget[];
  /** 옮기기: 고른 단계 id / 함께 지우기: null */
  onDecide: (moveTo: string | null) => void;
  onCancel: () => void;
}

/**
 * 태스크가 있는 단계가 없어질 때 묻는 확인 창 (프로젝트 R14).
 * "'<단계>'에 태스크 N개가 있어요" + 옮길 단계 선택 + `취소` / `함께 지우기` / `옮기기`.
 * 확인 창(ConfirmDialog)과 같은 모양이고, Esc·바깥 클릭은 취소다. 처음 포커스는 단계 선택 칸.
 */
function RemoveStageConfirm({ stageLabel, taskCount, targets, onDecide, onCancel }: RemoveStageConfirmProps) {
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);
  const [moveTo, setMoveTo] = useState(targets[0]?.id ?? "");
  const title = `'${stageLabel}'에 태스크 ${taskCount}개가 있어요`;

  useEscapeLayer(onCancel);
  useDialogFocus(boxRef);

  if (!root) return null;
  return createPortal(
    <div
      className="confirm-layer"
      {...{ [KEEP_POPOVERS_ATTR]: "" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div ref={boxRef} className="confirm" role="alertdialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <h4 className="confirm__title">{title}</h4>
        <p className="confirm__message">다른 단계로 옮기거나 단계와 함께 지울 수 있어요.</p>
        <label className="proj-field proj-remove__field">
          <span className="proj-field__label">옮길 단계</span>
          <select
            className="proj-input proj-select"
            value={moveTo}
            autoFocus
            onChange={(e) => setMoveTo(e.target.value)}
          >
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className="confirm__buttons">
          <button type="button" className="confirm__cancel" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="confirm__danger" onClick={() => onDecide(null)}>
            함께 지우기
          </button>
          <button
            type="button"
            className="confirm__primary"
            disabled={moveTo === ""}
            onClick={() => onDecide(moveTo)}
          >
            옮기기
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}

export default RemoveStageConfirm;
