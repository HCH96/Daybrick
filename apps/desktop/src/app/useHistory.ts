import { useCallback, useState } from "react";
import type { PageId } from "./types";

const MAX_ENTRIES = 50;

/** 방문 기록 한 칸. sub는 화면 안의 하위 위치(예: 프로젝트 상세의 프로젝트 id) */
export interface HistoryEntry {
  page: PageId;
  sub?: string;
}

interface HistoryState {
  entries: HistoryEntry[]; // 방문한 화면 순서
  index: number; // 지금 보고 있는 위치
}

/**
 * 브라우저처럼 동작하는 화면 방문 기록.
 * - navigate: 지금 위치 뒤의 기록을 지우고 새 화면을 쌓는다. 지금 화면과 page·sub가 같으면 쌓지 않는다.
 * - goBack / goForward: 위치만 앞뒤로 옮긴다.
 */
export function useHistory(initialPage: PageId) {
  const [state, setState] = useState<HistoryState>({ entries: [{ page: initialPage }], index: 0 });

  const navigate = useCallback((page: PageId, sub?: string) => {
    setState((prev) => {
      const now = prev.entries[prev.index];
      if (now.page === page && now.sub === sub) return prev;
      const entry: HistoryEntry = sub === undefined ? { page } : { page, sub };
      const entries = [...prev.entries.slice(0, prev.index + 1), entry].slice(-MAX_ENTRIES);
      return { entries, index: entries.length - 1 };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => (prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev));
  }, []);

  const goForward = useCallback(() => {
    setState((prev) =>
      prev.index < prev.entries.length - 1 ? { ...prev, index: prev.index + 1 } : prev,
    );
  }, []);

  const current = state.entries[state.index];
  return {
    currentPage: current.page,
    currentSub: current.sub,
    canGoBack: state.index > 0,
    canGoForward: state.index < state.entries.length - 1,
    navigate,
    goBack,
    goForward,
  };
}
