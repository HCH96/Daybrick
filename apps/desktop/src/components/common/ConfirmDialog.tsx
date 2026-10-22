import { useRef } from "react";
import { createPortal } from "react-dom";
import { useOverlayRoot } from "../layout/overlayRoot";
import { useDialogFocus } from "./useDialogFocus";
import { useEscapeLayer } from "./useEscapeLayer";
import { KEEP_POPOVERS_ATTR } from "./useOutsideLayer";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 되돌릴 수 없는 동작 전에 묻는 작은 확인 창 (예: 지원 삭제, R16).
 * 다른 팝업 위에 한 겹 더 어둡게 덮는다. Esc·바깥 클릭·취소는 모두 취소로 처리한다.
 * 실수로 Enter를 눌러 지우지 않도록 처음 포커스는 "취소"에 둔다.
 */
function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);

  useEscapeLayer(onCancel);
  useDialogFocus(boxRef);

  if (!root) return null;
  return createPortal(
    <div
      className="confirm-layer"
      // 작은 창(Popover)에서 연 확인 창을 누를 때 그 작은 창이 닫혀 확인 창까지 사라지지 않게
      {...{ [KEEP_POPOVERS_ATTR]: "" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div ref={boxRef} className="confirm" role="alertdialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <h4 className="confirm__title">{title}</h4>
        <p className="confirm__message">{message}</p>
        <div className="confirm__buttons">
          <button type="button" className="confirm__cancel" onClick={onCancel} autoFocus>
            취소
          </button>
          <button type="button" className="confirm__danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}

export default ConfirmDialog;
