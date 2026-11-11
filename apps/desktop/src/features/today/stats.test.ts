import { describe, expect, it } from "vitest";
import { dayTotal, dayTotals, sessionElapsed, splitByDay, taskTotalOn } from "./stats";
import type { RunningTimer, TodayData } from "./types";

const MIN = 60_000;
/** 서울 시간(테스트 설정 TZ) 시각 */
const at = (iso: string) => `${iso}:00+09:00`;

function data(records: TodayData["records"], running: RunningTimer | null = null): TodayData {
  return { version: 1, records, running, settings: { dailyGoalMinutes: 360 } };
}

describe("자정 넘는 기록", () => {
  it("23:30~00:30 기록은 두 날에 30분씩 나뉜다", () => {
    const byDay = splitByDay([
      { taskId: "t1", start: Date.parse(at("2026-11-10T23:30")), end: Date.parse(at("2026-11-11T00:30")) },
    ]);
    expect([...byDay.keys()]).toEqual(["2026-11-10", "2026-11-11"]);
    const minutes = (key: string) => byDay.get(key)!.reduce((t, s) => t + (s.end - s.start), 0) / MIN;
    expect(minutes("2026-11-10")).toBe(30);
    expect(minutes("2026-11-11")).toBe(30);
  });

  it("길이 0 이하 구간은 빠진다", () => {
    const t = Date.parse(at("2026-11-11T10:00"));
    expect(splitByDay([{ taskId: "t1", start: t, end: t }]).size).toBe(0);
  });
});

describe("하루 합계", () => {
  const d = data([
    { id: "r1", taskId: "t1", start: at("2026-11-11T09:00"), end: at("2026-11-11T10:00") },
    { id: "r2", taskId: "t2", start: at("2026-11-11T11:00"), end: at("2026-11-11T11:30") },
    { id: "r3", taskId: "t1", start: at("2026-11-12T09:00"), end: at("2026-11-12T09:10") },
  ]);
  const now = Date.parse(at("2026-11-12T12:00"));

  it("날짜별·태스크별로 더한다", () => {
    expect(dayTotal(d, "2026-11-11", now) / MIN).toBe(90);
    expect(taskTotalOn(d, "t1", "2026-11-11", now) / MIN).toBe(60);
    expect(dayTotals(d, now).get("2026-11-12")! / MIN).toBe(10);
  });

  it("기록 없는 날은 0이다", () => {
    expect(dayTotal(d, "2026-11-13", now)).toBe(0);
  });
});

describe("실행 중 타이머", () => {
  const running: RunningTimer = {
    taskId: "t1",
    state: "running",
    segments: [
      { start: at("2026-11-11T09:00"), end: at("2026-11-11T09:20") },
      { start: at("2026-11-11T09:30"), end: null },
    ],
    lastSeenAt: at("2026-11-11T09:40"),
  };
  const now = Date.parse(at("2026-11-11T09:45"));

  it("세션 시간에는 일시정지한 시간이 빠진다", () => {
    expect(sessionElapsed(running, now) / MIN).toBe(35); // 20 + 15
  });

  it("하루 합계에 지금 세션이 들어간다", () => {
    expect(dayTotal(data([], running), "2026-11-11", now) / MIN).toBe(35);
  });
});
