import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOverlayRoot } from "../layout/overlayRoot";
import { useEscapeLayer } from "./useEscapeLayer";
import { useOutsideLayer } from "./useOutsideLayer";
import "./Popover.css";

/**
 * 버튼 아래(왼쪽 맞춤), 버튼 아래(오른쪽 맞춤) 또는 버튼 오른쪽(위 맞춤)에 띄운다.
 * 자리가 모자라면 반대쪽으로 뒤집는다.
 */
export type PopoverPlacement = "bottom-start" | "bottom-end" | "right-start";

interface PopoverProps {
  /** 이 요소 옆에 띄운다 (보통 창을 연 버튼) */
  anchor: HTMLElement;
  onClose: () => void;
  placement?: PopoverPlacement;
  width?: number;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}

const GAP = 4; // 버튼과 창 사이
const MARGIN = 8; // 겹침 층 가장자리와 창 사이

/**
 * 버튼 옆에 뜨는 작은 창 (속성 값 고르기, 메뉴 등).
 * Modal처럼 겹침 층(useOverlayRoot)에 그리고, Esc는 맨 위 창만 닫는다(useEscapeLayer).
 * 바깥을 누르면 닫힌다(useOutsideLayer). 스크롤·창 크기 변경·내용 크기 변경 때 자리를 다시 잡는다.
 */
function Popover({ anchor, onClose, placement = "bottom-start", width, ariaLabel, className, children }: PopoverProps) {
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEscapeLayer(onClose);
  useOutsideLayer(boxRef, anchor, onClose);

  const place = useCallback(() => {
    const box = boxRef.current;
    if (!root || !box) return;
    const area = root.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    const w = box.offsetWidth;
    const h = box.offsetHeight;

    let top: number;
    let left: number;
    if (placement === "bottom-start" || placement === "bottom-end") {
      // bottom-end: 창의 오른쪽 끝을 버튼 오른쪽 끝에 맞춘다 (제목 표시줄 오른쪽 알림 패널)
      left = placement === "bottom-start" ? a.left - area.left : a.right - area.left - w;
      top = a.bottom - area.top + GAP;
      if (top + h > area.height - MARGIN) top = a.top - area.top - GAP - h; // 아래가 모자라면 위로
    } else {
      left = a.right - area.left + GAP;
      top = a.top - area.top - 6;
      if (left + w > area.width - MARGIN) left = a.left - area.left - GAP - w; // 오른쪽이 모자라면 왼쪽으로
    }
    left = clamp(left, MARGIN, area.width - w - MARGIN);
    top = clamp(top, MARGIN, area.height - h - MARGIN);
    setPosition((p) => (p && p.top === top && p.left === left ? p : { top, left }));
  }, [root, anchor, placement]);

  useLayoutEffect(() => {
    place();
    const box = boxRef.current;
    const observer = new ResizeObserver(place);
    if (box) observer.observe(box);
    // 스크롤은 거품처럼 올라오지 않으므로 캡처 단계에서 받는다 (상세 팝업 안 스크롤 포함)
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [place]);

  // 닫혀서 포커스가 갈 곳을 잃었으면 창을 연 버튼으로 돌려준다.
  // 다른 칸을 눌러 닫힌 경우에는 그 칸의 포커스를 빼앗지 않는다.
  // 화면에서 실제로 사라진 뒤에 확인한다: 개발 모드(StrictMode)는 효과를 한 번 껐다 켜 보는데,
  // 그때 바로 포커스를 옮기면 안의 입력 칸 포커스를 빼앗기 때문이다.
  useLayoutEffect(() => {
    const box = boxRef.current;
    return () => {
      queueMicrotask(() => {
        if (box?.isConnected) return; // 아직 화면에 있다 = 껐다 켜 보기였을 뿐
        const active = document.activeElement;
        if ((!active || active === document.body) && anchor.isConnected) anchor.focus();
      });
    };
  }, [anchor]);

  if (!root) return null;

  const style: CSSProperties = {
    width,
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    // 자리를 재기 전에는 투명하게 둔다. visibility: hidden이면 안의 입력 칸이 autoFocus를 받지 못한다.
    opacity: position ? 1 : 0,
  };

  return createPortal(
    <div
      ref={boxRef}
      className={className ? `popover ${className}` : "popover"}
      role="dialog"
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </div>,
    root,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

export default Popover;
