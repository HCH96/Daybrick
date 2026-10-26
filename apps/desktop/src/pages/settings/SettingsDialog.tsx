import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "../../components/common/useDialogFocus";
import { useEscapeLayer } from "../../components/common/useEscapeLayer";
import { CrossIcon } from "../../components/icons/ServerIcons";
import { useOverlayRoot } from "../../components/layout/overlayRoot";
import "../server-setup/wizard/WizardShell.css";
import "../server-setup/wizard/WizardFields.css";
import "./SettingsDialog.css";

interface SettingsDialogProps {
  title: string;
  icon: ReactNode;
  /** 닫기 ([×]·Esc·바깥 클릭). 실행 중이라 닫을 수 없으면 null. */
  onClose: (() => void) | null;
  children: ReactNode;
  /** 아래 버튼 줄 */
  footer: ReactNode;
}

/** 설정 서버 연결 칸의 작은 창 틀 (키 교체·자동 세팅 다시 실행). 목업 parts.css의 modal·modal-head·modal-body·modal-foot 기준 */
function SettingsDialog({ title, icon, onClose, children, footer }: SettingsDialogProps) {
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => onClose?.());
  useDialogFocus(boxRef);

  if (!root) return null;
  return createPortal(
    <div
      className="set-dialog-layer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div ref={boxRef} className="set-dialog" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <div className="set-dialog__head">
          <span className="set-dialog__icon">{icon}</span>
          <h3>{title}</h3>
          {onClose && (
            <button type="button" className="set-dialog__x" aria-label="닫기" onClick={onClose}>
              <CrossIcon size={16} />
            </button>
          )}
        </div>
        <div className="set-dialog__body">{children}</div>
        <div className="set-dialog__foot">{footer}</div>
      </div>
    </div>,
    root,
  );
}

export default SettingsDialog;
