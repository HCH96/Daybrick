import type { AppNotification, NotifyInput } from "./types";

/** 확인한 알림을 남겨 두는 기간 (R27, D5) */
export const READ_KEEP_DAYS = 30;
/** 목록에 보여주는 최대 개수 (D5) */
export const LIST_LIMIT = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

/** 로컬 알림 id (`local-` 접두어 + uuid) */
export function newLocalId(): string {
  return `local-${crypto.randomUUID()}`;
}

/**
 * 저장할 시각: max(now, 목록의 가장 늦은 updatedAt + 1ms) (D17).
 * 시각을 읽을 수 없는 알림은 건너뛴다.
 */
function nextStamp(list: readonly AppNotification[], now: Date): string {
  let latest = Number.NEGATIVE_INFINITY;
  for (const n of list) {
    const time = Date.parse(n.updatedAt);
    if (!Number.isNaN(time) && time > latest) latest = time;
  }
  return new Date(Math.max(now.getTime(), latest + 1)).toISOString();
}

/** 시각 비교용 숫자. 읽을 수 없으면 가장 오래된 것으로 친다. */
function timeOf(iso: string): number {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

/** 내림차순 비교 (b가 크면 양수, 같으면 0) */
function desc<T extends number | string>(a: T, b: T): number {
  if (a === b) return 0;
  return b > a ? 1 : -1;
}

/**
 * 알림 하나를 목록에 넣는다 (R24, D6).
 * 같은 source·mergeKey의 안 읽은 알림이 있으면 그 알림의 제목·내용·updatedAt만 바꾼다.
 * 없으면(키가 없거나 같은 키가 모두 확인됨) 새 알림을 만든다.
 * 저장 시각은 목록의 가장 늦은 updatedAt보다 늦게 잡아 겹치지 않게 한다 (R10, D17).
 */
export function mergeNotification(
  list: readonly AppNotification[],
  input: NotifyInput,
  now: Date,
  makeId: () => string = newLocalId,
): AppNotification[] {
  const at = nextStamp(list, now);
  if (input.mergeKey !== undefined) {
    const index = list.findIndex(
      (n) => n.readAt === null && n.source === input.source && n.mergeKey === input.mergeKey,
    );
    if (index >= 0) {
      const updated: AppNotification = { ...list[index], title: input.title, body: input.body, updatedAt: at };
      return list.map((n, i) => (i === index ? updated : n));
    }
  }
  const created: AppNotification = {
    id: makeId(),
    origin: "local",
    source: input.source,
    kind: input.kind,
    importance: input.importance,
    title: input.title,
    body: input.body,
    ...(input.target !== undefined ? { target: input.target } : {}),
    ...(input.mergeKey !== undefined ? { mergeKey: input.mergeKey } : {}),
    createdAt: at,
    updatedAt: at,
    readAt: null,
  };
  return [...list, created];
}

/** 확인한 지 30일이 지난 알림을 지운다. 안 읽은 알림은 지우지 않는다 (R27). */
export function pruneRead(list: readonly AppNotification[], now: Date): AppNotification[] {
  const limit = now.getTime() - READ_KEEP_DAYS * DAY_MS;
  return list.filter((n) => {
    if (n.readAt === null) return true;
    const readTime = Date.parse(n.readAt);
    // 시각을 읽을 수 없으면 지우지 않고 남긴다.
    return Number.isNaN(readTime) || readTime > limit;
  });
}

/** 안 읽은 알림 수 (배지에 씀) */
export function countUnread(list: readonly AppNotification[]): number {
  return list.reduce((count, n) => (n.readAt === null ? count + 1 : count), 0);
}

/** 알림 하나를 확인 처리한다. 이미 확인했으면 그대로 둔다. */
export function markRead(list: readonly AppNotification[], id: string, now: Date): AppNotification[] {
  const at = now.toISOString();
  return list.map((n) => (n.id === id && n.readAt === null ? { ...n, readAt: at } : n));
}

/** 확인한 알림을 다시 안 읽음으로 되돌린다. */
export function markUnread(list: readonly AppNotification[], id: string): AppNotification[] {
  return list.map((n) => (n.id === id && n.readAt !== null ? { ...n, readAt: null } : n));
}

/** 안 읽은 알림을 모두 확인 처리한다. */
export function markAllRead(list: readonly AppNotification[], now: Date): AppNotification[] {
  const at = now.toISOString();
  return list.map((n) => (n.readAt === null ? { ...n, readAt: at } : n));
}

/**
 * 목록에 보여줄 순서 (R10, D17): updatedAt 최신순 → createdAt 최신순 → id 내림차순.
 * 정렬한 뒤 최대 50개를 자른다.
 */
export function sortForList(list: readonly AppNotification[], limit: number = LIST_LIMIT): AppNotification[] {
  return [...list]
    .sort(
      (a, b) =>
        desc(timeOf(a.updatedAt), timeOf(b.updatedAt)) ||
        desc(timeOf(a.createdAt), timeOf(b.createdAt)) ||
        desc(a.id, b.id),
    )
    .slice(0, limit);
}
