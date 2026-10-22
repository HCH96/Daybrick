import { useEffect, type RefObject } from "react";

/**
 * 창이 열리면 창 안으로 포커스를 옮기고, 닫히면 열기 전에 포커스가 있던 곳(예: 카드)으로 돌려준다.
 * 창 안의 요소가 이미 autoFocus로 포커스를 가져갔으면 그대로 둔다.
 */
export function useDialogFocus(boxRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const box = boxRef.current;
    if (box && !box.contains(document.activeElement)) box.focus();
    return () => {
      if (previous && previous.isConnected) previous.focus();
    };
  }, [boxRef]);
}
