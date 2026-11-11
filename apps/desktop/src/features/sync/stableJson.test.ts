import { describe, expect, it } from "vitest";
import { latestUpdatedAt } from "./resolve";
import { hashOf, stableStringify } from "./stableJson";

describe("키를 정렬한 JSON", () => {
  it("객체 키 순서만 다르면 같은 문자열·해시가 된다", async () => {
    const a = { b: 1, a: { d: [1, 2], c: "x" } };
    const b = { a: { c: "x", d: [1, 2] }, b: 1 };
    expect(stableStringify(a)).toBe(stableStringify(b));
    expect(await hashOf(a)).toBe(await hashOf(b));
  });

  it("배열 순서가 다르면 다른 해시가 된다", async () => {
    expect(await hashOf([1, 2])).not.toBe(await hashOf([2, 1]));
  });

  it("JSON.stringify처럼 undefined 칸은 빠지고 배열 안에서는 null이 된다", () => {
    expect(stableStringify({ a: undefined, b: 1 })).toBe('{"b":1}');
    expect(stableStringify([undefined, 1])).toBe("[null,1]");
    expect(stableStringify(undefined)).toBe("null");
  });

  it("해시는 16진수 64자다", async () => {
    expect(await hashOf({})).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("가장 늦은 수정 시각", () => {
  it("updatedAt·end·lastSeenAt 중 가장 늦은 것을 찾는다", () => {
    const value = {
      tasks: [{ updatedAt: "2026-11-01T00:00:00.000Z" }, { updatedAt: "2026-11-05T00:00:00.000Z" }],
      records: [{ start: "2026-11-09T00:00:00.000Z", end: "2026-11-06T00:00:00.000Z" }],
      running: { lastSeenAt: "2026-11-07T00:00:00.000Z" },
    };
    expect(latestUpdatedAt(value)).toBe("2026-11-07T00:00:00.000Z"); // start는 보지 않는다
  });

  it("시각이 없거나 읽을 수 없으면 null이다", () => {
    expect(latestUpdatedAt({ tasks: [] })).toBeNull();
    expect(latestUpdatedAt({ updatedAt: "모름" })).toBeNull();
  });
});
