import { createContext, useContext } from "react";
import type { PageId } from "./types";

export interface Navigation {
  currentPage: PageId;
  navigate: (page: PageId) => void;
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
