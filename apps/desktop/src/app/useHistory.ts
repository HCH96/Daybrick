import { useCallback, useState } from "react";
import type { PageId } from "./types";

const MAX_ENTRIES = 50;

interface HistoryState {
  entries: PageId[]; // 방문한 화면 순서
  index: number; // 지금 보고 있는 위치
}

/**
 * 브라우저처럼 동작하는 화면 방문 기록.
 * - navigate: 지금 위치 뒤의 기록을 지우고 새 화면을 쌓는다. 지금 화면과 같으면 쌓지 않는다.
 * - goBack / goForward: 위치만 앞뒤로 옮긴다.
 */
export function useHistory(initialPage: PageId) {
  const [state, setState] = useState<HistoryState>({ entries: [initialPage], index: 0 });

  const navigate = useCallback((page: PageId) => {
    setState((prev) => {
      if (prev.entries[prev.index] === page) return prev;
      const entries = [...prev.entries.slice(0, prev.index + 1), page].slice(-MAX_ENTRIES);
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

  return {
    currentPage: state.entries[state.index],
    canGoBack: state.index > 0,
    canGoForward: state.index < state.entries.length - 1,
    navigate,
    goBack,
    goForward,
  };
}
