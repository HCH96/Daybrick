import { useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOverlayRoot } from "../layout/overlayRoot";
import { useDialogFocus } from "./useDialogFocus";
import { useEscapeLayer } from "./useEscapeLayer";
import "./Modal.css";

interface ModalProps {
  onClose: () => void;
  /** true면 어두운 막 없이 본문 영역을 꽉 채운다 (사이드바가 펼쳐져 있으면 사이드바는 남긴다) */
  maximized?: boolean;
  ariaLabel: string;
  children: ReactNode;
}

/**
 * 앱 안 가운데에 뜨는 팝업 (OS 창 아님).
 * 기본: 사이드바·본문 전체를 어둡게 덮고 가운데 상자. 바깥 클릭·Esc로 닫힌다.
 * 최대화: 본문 영역을 꽉 채운다. Esc로 닫힌다.
 */
function Modal({ onClose, maximized = false, ariaLabel, children }: ModalProps) {
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);
  // 바깥에서 누르고 바깥에서 뗐을 때만 닫는다 (제목을 드래그하다 바깥에서 떼면 닫히지 않게)
  const pressedOutside = useRef(false);

  useEscapeLayer(onClose);
  useDialogFocus(boxRef);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    pressedOutside.current = e.target === e.currentTarget;
  };
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!maximized && pressedOutside.current && e.target === e.currentTarget) onClose();
    pressedOutside.current = false;
  };

  if (!root) return null;
  return createPortal(
    <div className={maximized ? "modal-layer modal-layer--max" : "modal-layer"} onMouseDown={onMouseDown} onClick={onClick}>
      <div ref={boxRef} className="modal" role="dialog" aria-modal="true" aria-label={ariaLabel} tabIndex={-1}>
        {children}
      </div>
    </div>,
    root,
  );
}

export default Modal;
