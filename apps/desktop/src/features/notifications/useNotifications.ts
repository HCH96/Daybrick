import { createContext, useContext } from "react";
import type { NotificationsState } from "./reducer";
import type { AppNotification } from "./types";

export interface NotificationsStore {
  state: NotificationsState;
  /** 목록에 보여줄 알림 (updatedAt 최신순, 50개). 읽는 중·실패면 빈 배열 */
  list: AppNotification[];
  /** 안 읽은 알림 전체 수 (배지) */
  unreadCount: number;
  /** 알림 하나를 확인 처리한다 */
  markRead: (id: string) => void;
  /** 확인한 알림을 안 읽음으로 되돌린다 */
  markUnread: (id: string) => void;
  /** 안 읽은 알림을 모두 확인 처리한다 */
  markAllRead: () => void;
}

/** 알림 상태와 동작을 하위 컴포넌트에 공유한다. NotificationsProvider가 값을 넣는다. */
export const NotificationsContext = createContext<NotificationsStore | null>(null);

export function useNotifications(): NotificationsStore {
  const store = useContext(NotificationsContext);
  if (!store) {
    throw new Error("useNotifications는 NotificationsProvider 안에서만 쓸 수 있다.");
  }
  return store;
}
