import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
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

  // 최대화 순간에는 left 전환 없이 바로 채우고, 최대화 상태에서 사이드바를 접고 펼 때만 전환한다.
  // 그래서 최대화 뒤 두 프레임(새 위치가 그려진 뒤)에 전환 클래스를 붙인다.
  const [followSidebar, setFollowSidebar] = useState(false);
  useEffect(() => {
    if (!maximized) {
      setFollowSidebar(false);
      return;
    }
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setFollowSidebar(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [maximized]);

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
    <div className={layerClass(maximized, followSidebar)} onMouseDown={onMouseDown} onClick={onClick}>
      <div ref={boxRef} className="modal" role="dialog" aria-modal="true" aria-label={ariaLabel} tabIndex={-1}>
        {children}
      </div>
    </div>,
    root,
  );
}

function layerClass(maximized: boolean, followSidebar: boolean): string {
  if (!maximized) return "modal-layer";
  return followSidebar ? "modal-layer modal-layer--max modal-layer--follow" : "modal-layer modal-layer--max";
}

export default Modal;
