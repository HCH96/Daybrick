import { createContext, useContext } from "react";
import type { PageId } from "./types";

export interface Navigation {
  currentPage: PageId;
  /** 화면 안의 하위 위치 (예: 프로젝트 상세의 프로젝트 id). 없으면 그 화면의 첫 모습 */
  currentSub?: string;
  /** sub 없이 부르면 그 화면의 첫 모습(목록 등)으로 간다 */
  navigate: (page: PageId, sub?: string) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

/** 현재 화면, 화면 바꾸기, 뒤로/앞으로를 하위 컴포넌트에 공유한다. App에서 Provider로 감싼다. */
export const NavigationContext = createContext<Navigation | null>(null);

export function useNavigation(): Navigation {
  const navigation = useContext(NavigationContext);
  if (!navigation) {
    throw new Error("useNavigation은 NavigationContext.Provider 안에서만 쓸 수 있다.");
  }
  return navigation;
}
