import { useCallback, useEffect, useRef, useState } from "react";

/** 칸 머리가 스크롤 영역 위쪽에서 이 거리 안에 들어오면 그 칸을 보고 있는 것으로 본다 */
const ACTIVE_OFFSET = 80;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 설정 칸 이름 줄용: 누르면 그 칸으로 스크롤하고, 스크롤에 따라 보고 있는 칸을 알려 준다.
 * 스크롤 영역은 칸을 감싼 가장 가까운 .app-layout__main 이다.
 */
export function useSectionAnchors(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const nodes = useRef(new Map<string, HTMLElement>());

  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) nodes.current.set(id, el);
      else nodes.current.delete(id);
    },
    [],
  );

  useEffect(() => {
    const first = nodes.current.get(ids[0] ?? "");
    const scroller = first?.closest<HTMLElement>(".app-layout__main");
    if (!scroller) return;

    const update = () => {
      // 맨 아래까지 내렸으면 마지막 칸 (짧은 마지막 칸은 위쪽까지 올라오지 못한다).
      // 스크롤할 것이 없는 화면(모두 한 번에 보임)은 첫 칸을 그대로 둔다
      const atBottom =
        scroller.scrollTop > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if (atBottom && ids.length > 0) {
        setActiveId(ids[ids.length - 1]);
        return;
      }
      const top = scroller.getBoundingClientRect().top + ACTIVE_OFFSET;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = nodes.current.get(id);
        if (el && el.getBoundingClientRect().top <= top) current = id;
      }
      setActiveId(current);
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);

  const scrollTo = useCallback((id: string) => {
    const el = nodes.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    setActiveId(id);
  }, []);

  return { activeId, register, scrollTo };
}
