import { describe, expect, it } from "vitest";
import { countUnread, markAllRead, markRead, markUnread, mergeNotification, pruneRead, sortForList } from "./logic";
import type { AppNotification, NotifyInput } from "./types";

const input = (over: Partial<NotifyInput> = {}): NotifyInput => ({
  source: "today",
  kind: "goal",
  importance: "info",
  title: "제목",
  body: "내용",
  ...over,
});

function note(id: string, over: Partial<AppNotification> = {}): AppNotification {
  return {
    id,
    origin: "local",
    source: "today",
    kind: "goal",
    importance: "info",
    title: id,
    body: "",
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
    readAt: null,
    ...over,
  };
}

const NOW = new Date("2026-11-11T00:00:00.000Z");
let seq = 0;
const makeId = () => `local-${++seq}`;

describe("알림 넣기", () => {
  it("같은 mergeKey의 안 읽은 알림은 새로 만들지 않고 내용만 바꾼다", () => {
    const first = mergeNotification([], input({ mergeKey: "k", title: "1개" }), NOW, makeId);
    const second = mergeNotification(first, input({ mergeKey: "k", title: "2개" }), NOW, makeId);
    expect(second).toHaveLength(1);
    expect(second[0].title).toBe("2개");
    expect(second[0].id).toBe(first[0].id);
  });

  it("같은 키라도 이미 확인한 알림이면 새로 만든다", () => {
    const list = [note("a", { mergeKey: "k", readAt: "2026-11-10T00:00:00.000Z" })];
    expect(mergeNotification(list, input({ mergeKey: "k" }), NOW, makeId)).toHaveLength(2);
  });

  it("저장 시각은 목록의 가장 늦은 시각보다 늦다 (시계가 뒤로 가도)", () => {
    const future = "2026-12-01T00:00:00.000Z";
    const list = [note("a", { updatedAt: future })];
    const added = mergeNotification(list, input(), NOW, makeId)[1];
    expect(Date.parse(added.updatedAt)).toBe(Date.parse(future) + 1);
  });
});

describe("읽음 처리", () => {
  const list = [note("a"), note("b"), note("c", { readAt: "2026-11-05T00:00:00.000Z" })];

  it("안 읽은 수를 센다", () => {
    expect(countUnread(list)).toBe(2);
    expect(countUnread(markAllRead(list, NOW))).toBe(0);
  });

  it("이미 확인한 알림의 확인 시각은 바꾸지 않는다", () => {
    expect(markRead(list, "c", NOW)[2].readAt).toBe("2026-11-05T00:00:00.000Z");
    expect(markRead(list, "a", NOW)[0].readAt).toBe(NOW.toISOString());
  });

  it("안 읽음으로 되돌린다", () => {
    expect(markUnread(list, "c")[2].readAt).toBeNull();
  });
});

describe("정리와 정렬", () => {
  it("확인한 지 30일이 지난 것만 지운다", () => {
    const list = [
      note("old", { readAt: "2026-10-01T00:00:00.000Z" }),
      note("recent", { readAt: "2026-11-01T00:00:00.000Z" }),
      note("unread-old", { createdAt: "2020-01-01T00:00:00.000Z" }),
      note("bad-time", { readAt: "모름" }),
    ];
    expect(pruneRead(list, NOW).map((n) => n.id)).toEqual(["recent", "unread-old", "bad-time"]);
  });

  it("updatedAt → createdAt → id 순으로 최신이 먼저, 개수 제한", () => {
    const list = [
      note("a", { updatedAt: "2026-11-02T00:00:00.000Z" }),
      note("b", { updatedAt: "2026-11-03T00:00:00.000Z" }),
      note("c", { updatedAt: "2026-11-02T00:00:00.000Z", createdAt: "2026-11-02T00:00:00.000Z" }),
      note("d", { updatedAt: "읽을 수 없음" }),
    ];
    expect(sortForList(list).map((n) => n.id)).toEqual(["b", "c", "a", "d"]);
    expect(sortForList(list, 2)).toHaveLength(2);
  });
});
