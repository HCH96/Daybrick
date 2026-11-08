import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "../../../components/common/useDialogFocus";
import { useEscapeLayer } from "../../../components/common/useEscapeLayer";
import { CrossIcon } from "../../../components/icons/ServerIcons";
import { useOverlayRoot } from "../../../components/layout/overlayRoot";
import "./SourcesDialog.css";

interface SourcesDialogProps {
  title: string;
  icon: ReactNode;
  /** 닫기 ([×]·Esc·바깥 클릭). 시험 수집·저장 중이라 닫을 수 없으면 null */
  onClose: (() => void) | null;
  /** 제목 오른쪽 (단계 표시 등) */
  headExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** 수집 사이트 탭의 큰 창 틀 (사이트 추가·어댑터 가이드). 목업 common.css의 modal·modal-head·modal-foot 기준 */
function SourcesDialog({ title, icon, onClose, headExtra, children, footer }: SourcesDialogProps) {
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => onClose?.());
  useDialogFocus(boxRef);

  if (!root) return null;
  return createPortal(
    <div
      className="js-dlg-layer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={boxRef}
        className="js-dlg"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="js-dlg__head">
          <span className="js-dlg__icon">{icon}</span>
          <h3>{title}</h3>
          {headExtra}
          <button type="button" className="js-dlg__x" aria-label="닫기" disabled={!onClose} onClick={() => onClose?.()}>
            <CrossIcon size={16} />
          </button>
        </div>
        {children}
        {footer && <div className="js-dlg__foot">{footer}</div>}
      </div>
    </div>,
    root,
  );
}

export default SourcesDialog;
