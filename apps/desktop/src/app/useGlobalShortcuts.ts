import { useEffect } from "react";

interface ShortcutHandlers {
  onToggleSidebar: () => void;
  onBack: () => void;
  onForward: () => void;
}

// 마우스 옆 버튼 번호 (MouseEvent.button)
const MOUSE_BACK = 3;
const MOUSE_FORWARD = 4;

/**
 * 앱 전체 단축키.
 * - Ctrl+B: 사이드바 접기·펼치기
 * - Alt+← / Alt+→: 뒤로 / 앞으로
 * - 마우스 옆 버튼: 뒤로 / 앞으로
 */
export function useGlobalShortcuts({ onToggleSidebar, onBack, onForward }: ShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (!e.repeat) onToggleSidebar();
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          onBack();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          onForward();
        }
      }
    };

    // WebView가 옆 버튼으로 자체 뒤로 가기를 하지 않도록 누를 때도 막는다.
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === MOUSE_BACK || e.button === MOUSE_FORWARD) e.preventDefault();
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === MOUSE_BACK) {
        e.preventDefault();
        onBack();
      } else if (e.button === MOUSE_FORWARD) {
        e.preventDefault();
        onForward();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onToggleSidebar, onBack, onForward]);
}
