import type { NotifyInput } from "./types";

/**
 * 다른 기능이 알림을 보내는 공용 함수 (R21, D9).
 * 로컬 저장·합치기·배지 갱신은 받는 쪽(NotificationsProvider)이 한다.
 * 받는 쪽이 아직 등록되지 않았으면(앱을 켜는 중, 파일 읽는 중) 대기 줄에 세워 둔다.
 */
type Receiver = (input: NotifyInput) => void;

let receiver: Receiver | null = null;
const queue: NotifyInput[] = [];

export function notify(input: NotifyInput): void {
  if (receiver) receiver(input);
  else queue.push(input);
}

/** 받는 쪽을 등록하고 대기 줄에 있던 알림을 차례로 넘긴다. 돌려준 함수로 등록을 푼다. */
export function registerNotifyReceiver(next: Receiver): () => void {
  receiver = next;
  while (queue.length > 0) {
    const input = queue.shift();
    if (input) next(input);
  }
  return () => {
    if (receiver === next) receiver = null;
  };
}
