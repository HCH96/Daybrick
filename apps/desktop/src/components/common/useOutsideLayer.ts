import { useEffect, useRef, type RefObject } from "react";

interface Layer {
  box: RefObject<HTMLElement | null>;
  anchor: HTMLElement | null;
  close: { current: () => void };
}

/** 지금 열린 작은 창들. 마지막에 열린 창이 맨 위다 (안쪽에서 연 창이 뒤에 쌓인다). */
const layers: Layer[] = [];

/** 이 표시가 붙은 곳(예: 확인 창)을 누르면 작은 창을 닫지 않는다 */
export const KEEP_POPOVERS_ATTR = "data-keep-popovers";

/**
 * 창 바깥을 누르면 그 창과, 그 위에 쌓인 창들을 닫는다.
 * - 안쪽 창(위에 쌓인 창)을 누르면 바깥 창은 그대로 둔다.
 * - 창을 연 버튼(anchor)을 누르면 닫지 않는다. 버튼의 클릭이 열기·닫기를 맡는다.
 * - 아무 창도 아닌 곳을 누르면 그 누름은 뒤 화면에 전달하지 않는다.
 *   (예: 상세 팝업 바깥을 눌러 작은 창을 닫을 때 상세 팝업까지 닫히지 않게)
 */
function onMouseDown(e: MouseEvent) {
  const target = e.target;
  if (!(target instanceof Node) || layers.length === 0) return;
  if (target instanceof Element && target.closest(`[${KEEP_POPOVERS_ATTR}]`)) return;

  let hit = -1;
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (layer.box.current?.contains(target) || layer.anchor?.contains(target)) {
      hit = i;
      break;
    }
  }
  const toClose = layers.slice(hit + 1);
  if (toClose.length === 0) return;
  if (hit === -1) e.stopPropagation();
  for (let i = toClose.length - 1; i >= 0; i--) toClose[i].close.current();
}

/** 창 하나를 바깥 누름 감시 목록에 올린다. 열려 있는 동안만 호출한다. */
export function useOutsideLayer(box: RefObject<HTMLElement | null>, anchor: HTMLElement | null, onClose: () => void): void {
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const layer: Layer = { box, anchor, close };
    layers.push(layer);
    if (layers.length === 1) window.addEventListener("mousedown", onMouseDown, true);
    return () => {
      const index = layers.indexOf(layer);
      if (index >= 0) layers.splice(index, 1);
      if (layers.length === 0) window.removeEventListener("mousedown", onMouseDown, true);
    };
  }, [box, anchor]);
}
