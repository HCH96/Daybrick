import { useRef } from "react";
import { createPortal } from "react-dom";
import { useOverlayRoot } from "../layout/overlayRoot";
import { useDialogFocus } from "./useDialogFocus";
import { useEscapeLayer } from "./useEscapeLayer";
import { KEEP_POPOVERS_ATTR } from "./useOutsideLayer";
import "./ConfirmDialog.css";

interface NoticeDialogProps {
  title: string;
  message: string;
  buttonLabel: string;
  /** 버튼을 눌렀을 때 */
  onConfirm: () => void;
  /** Esc를 눌렀을 때: 안내만 닫는다 (버튼과 다르게 처리할 수 있게 따로 받는다) */
  onDismiss: () => void;
}

/**
 * 버튼 하나짜리 안내 창 (예: 첫 닫기 안내, 백그라운드 실행 R4).
 * 모양은 ConfirmDialog와 같은 CSS를 쓴다. 바깥 클릭으로는 닫지 않고, 처음 포커스는 버튼에 둔다.
 */
function NoticeDialog({ title, message, buttonLabel, onConfirm, onDismiss }: NoticeDialogProps) {
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);

  useEscapeLayer(onDismiss);
  useDialogFocus(boxRef);

  if (!root) return null;
  return createPortal(
    <div className="confirm-layer" {...{ [KEEP_POPOVERS_ATTR]: "" }}>
      <div ref={boxRef} className="confirm" role="alertdialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <h4 className="confirm__title">{title}</h4>
        <p className="confirm__message">{message}</p>
        <div className="confirm__buttons">
          <button type="button" className="confirm__primary" onClick={onConfirm} autoFocus>
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}

export default NoticeDialog;
