import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigation } from "./navigation";
import { pages } from "./pages";
import type { PageId } from "./types";

/** 열어 달라는 곳: 페이지 id와 그 안의 탭·팝업 이름 (알림의 갈 곳 등). 페이지 id는 아직 확인 전이라 문자열이다. */
export interface OpenTarget {
  page: string;
  tab?: string;
  popup?: string;
}

/** 맡겨 둔 열기 요청. 페이지가 확인된 뒤라 PageId다. */
export interface PageIntent {
  page: PageId;
  tab?: string;
  popup?: string;
}

interface PageIntentApi {
  openTarget: (target: OpenTarget) => boolean;
  /** 요청이 새로 맡겨질 때마다 바뀐다 (usePageIntent가 다시 확인하는 신호) */
  version: number;
  /** 자기 페이지의 요청이면 꺼내고 비운다 */
  take: (pageId: PageId) => PageIntent | null;
}

/** Provider가 없으면(제목 표시줄만 있는 전체 화면) 이동할 수 없는 상태다. */
const PageIntentContext = createContext<PageIntentApi | null>(null);

function findPageId(page: string): PageId | null {
  const def = pages.find((p) => p.id === page);
  return def ? def.id : null;
}

/**
 * 열기 요청 하나를 맡아 두는 Provider (D10).
 * navigate는 고치지 않고, 요청을 맡긴 뒤 navigate만 부른다. 탭·팝업을 실제로 여는 일은 각 화면이 usePageIntent로 한다.
 * NavigationContext 안쪽, TitleBar보다 바깥에 둔다.
 */
export function PageIntentProvider({ children }: { children?: ReactNode }) {
  const { navigate } = useNavigation();
  // 요청은 ref에 두고 꺼낼 때 바로 비운다 (StrictMode에서 effect가 두 번 돌아도 한 번만 꺼내지도록)
  const intentRef = useRef<PageIntent | null>(null);
  const [version, setVersion] = useState(0);

  const openTarget = useCallback(
    (target: OpenTarget): boolean => {
      const page = findPageId(target.page);
      if (!page) return false;
      intentRef.current = { page, tab: target.tab, popup: target.popup };
      setVersion((v) => v + 1);
      navigate(page);
      return true;
    },
    [navigate],
  );

  const take = useCallback((pageId: PageId): PageIntent | null => {
    const intent = intentRef.current;
    if (!intent || intent.page !== pageId) return null;
    intentRef.current = null;
    return intent;
  }, []);

  const api = useMemo<PageIntentApi>(() => ({ openTarget, version, take }), [openTarget, version, take]);
  return <PageIntentContext.Provider value={api}>{children}</PageIntentContext.Provider>;
}

/** 갈 곳으로 이동한다. 페이지가 없거나 이동할 수 없는 상태면 false (R16, R17). */
export function useOpenTarget(): (target: OpenTarget) => boolean {
  const api = useContext(PageIntentContext);
  return api ? api.openTarget : () => false;
}

/**
 * 화면이 마운트되거나 새 요청이 왔을 때, 자기 페이지의 요청을 한 번 꺼내 handler에 넘긴다 (R25).
 * 예: usePageIntent("applications", (intent) => { if (intent.popup) openPopup(intent.popup); });
 */
export function usePageIntent(pageId: PageId, handler: (intent: PageIntent) => void): void {
  const api = useContext(PageIntentContext);
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  const version = api?.version ?? 0;
  const take = api?.take;

  useEffect(() => {
    if (!take) return;
    const intent = take(pageId);
    if (intent) handlerRef.current(intent);
  }, [take, version, pageId]);
}
