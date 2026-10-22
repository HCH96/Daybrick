import { createContext, useContext } from "react";

/**
 * 팝업·확인 창을 그려 넣을 자리 (제목 표시줄 아래, 사이드바 + 본문 전체를 덮는 층).
 * AppLayout이 이 자리를 만들어 넘겨주고, Modal 등은 createPortal로 여기에 그린다.
 */
export const OverlayRootContext = createContext<HTMLElement | null>(null);

export function useOverlayRoot(): HTMLElement | null {
  return useContext(OverlayRootContext);
}
