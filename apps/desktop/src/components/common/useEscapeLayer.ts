import { useEffect, useRef } from "react";

type Handler = { current: () => void };

/** 지금 열린 창들. 마지막에 열린 창이 맨 위다. */
const layers: Handler[] = [];

/**
 * Esc를 누르면 onEscape를 부른다. 창이 여러 개 겹쳐 있으면 맨 위 창만 반응한다.
 * (예: 상세 팝업 위에 삭제 확인 창이 떠 있으면 Esc는 확인 창만 닫는다)
 */
export function useEscapeLayer(onEscape: () => void): void {
  const handler = useRef(onEscape);
  handler.current = onEscape;

  useEffect(() => {
    const me: Handler = handler;
    layers.push(me);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.isComposing) return; // 한글 조합 중 Esc는 조합 취소용
      if (layers[layers.length - 1] !== me) return;
      e.preventDefault();
      me.current();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      const index = layers.lastIndexOf(me);
      if (index >= 0) layers.splice(index, 1);
    };
  }, []);
}
