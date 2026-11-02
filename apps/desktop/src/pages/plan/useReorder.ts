import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/** 이만큼 넘게 움직여야 끌기로 본다. 그 전에 놓으면 클릭 (D12) */
const DRAG_THRESHOLD = 4;

interface DragState {
  from: number;
  /** 놓일 자리: 0 = 맨 앞, count = 맨 끝 (항목 사이 틈 번호) */
  gap: number;
}

export interface Reorder {
  /** 끌고 있는 항목 자리 (끌지 않으면 null) */
  dragIndex: number | null;
  /** 놓일 자리 줄을 그릴 틈 번호. 놓아도 순서가 그대로인 자리면 null */
  dropGap: number | null;
  /** 끌 수 있는 항목의 바깥 요소를 등록한다 (자리 계산용) */
  itemRef: (index: number) => (el: HTMLElement | null) => void;
  /** 끌기를 시작할 요소(손잡이)의 onPointerDown */
  startDrag: (index: number) => (e: ReactPointerEvent<HTMLElement>) => void;
}

/**
 * 세로 목록을 끌어 순서 바꾸기 (카테고리 머리, 나중에 체크리스트 항목).
 * 포인터 이벤트로 직접 만든다 (D12). 4px 넘게 움직이면 끌기를 시작하고, 놓일 자리를 줄로 보이며,
 * 놓으면 onMove(from, to)를 부른다. 끌고 난 직후의 클릭은 막는다.
 * 버튼·입력칸 위에서 누른 것은 끌기로 보지 않는다.
 */
export function useReorder(count: number, onMove: (from: number, to: number) => void): Reorder {
  const items = useRef<(HTMLElement | null)[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);

  const itemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      items.current[index] = el;
    },
    [],
  );

  const gapAt = useCallback(
    (y: number): number => {
      for (let i = 0; i < count; i++) {
        const el = items.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (y < r.top + r.height / 2) return i;
      }
      return count;
    },
    [count],
  );

  const startDrag = useCallback(
    (index: number) => (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("button, input, textarea")) return;
      const startY = e.clientY;
      let dragging = false;
      let gap = index;

      const onPointerMove = (ev: PointerEvent) => {
        if (!dragging) {
          if (Math.abs(ev.clientY - startY) <= DRAG_THRESHOLD) return;
          dragging = true;
          document.body.style.userSelect = "none";
        }
        gap = gapAt(ev.clientY);
        setDrag({ from: index, gap });
      };
      const finish = (drop: boolean) => {
        cleanup.current?.();
        if (!dragging) return;
        setDrag(null);
        // 끌고 난 뒤 이어지는 클릭(접기 등)이 눌리지 않게 한 번 막는다
        const stopClick = (ev: MouseEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        window.addEventListener("click", stopClick, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", stopClick, { capture: true }), 0);
        if (drop) {
          const to = gap > index ? gap - 1 : gap;
          if (to !== index) onMove(index, to);
        }
      };
      const onPointerUp = () => finish(true);
      const onPointerCancel = () => finish(false);
      const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") finish(false);
      };

      cleanup.current?.();
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
      window.addEventListener("keydown", onKeyDown);
      cleanup.current = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerCancel);
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.userSelect = "";
        cleanup.current = null;
      };
    },
    [gapAt, onMove],
  );

  const unchanged = drag !== null && (drag.gap === drag.from || drag.gap === drag.from + 1);
  return {
    dragIndex: drag?.from ?? null,
    dropGap: drag && !unchanged ? drag.gap : null,
    itemRef,
    startDrag,
  };
}
