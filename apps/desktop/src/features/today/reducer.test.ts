import { describe, expect, it } from "vitest";
import { GOAL_MAX_MINUTES, reducer, type TodayAction, type TodayState } from "./reducer";
import type { TodayData } from "./types";

const empty: TodayData = { version: 1, records: [], running: null, settings: { dailyGoalMinutes: 360 } };
const ready = (data: TodayData = empty): TodayState => ({ kind: "ready", data });

/** 동작을 차례로 적용한 뒤의 데이터 */
function run(actions: TodayAction[], start: TodayState = ready()): TodayData {
  const end = actions.reduce(reducer, start);
  if (end.kind !== "ready") throw new Error("ready 상태가 아님");
  return end.data;
}

const T = (hhmm: string) => `2026-11-11T${hhmm}:00.000Z`;

describe("타이머 시작·일시정지·재개·끝내기", () => {
  it("일시정지했다 재개하면 구간 두 개가 기록 두 개가 된다", () => {
    const data = run([
      { type: "start", taskId: "t1", now: T("01:00") },
      { type: "pause", now: T("01:30") },
      { type: "resume", now: T("02:00") },
      { type: "finish", now: T("02:15"), recordIds: ["r1", "r2"] },
    ]);
    expect(data.running).toBeNull();
    expect(data.records).toEqual([
      { id: "r1", taskId: "t1", start: T("01:00"), end: T("01:30") },
      { id: "r2", taskId: "t1", start: T("02:00"), end: T("02:15") },
    ]);
  });

  it("이미 도는 타이머가 있으면 새로 시작하지 않는다", () => {
    const data = run([
      { type: "start", taskId: "t1", now: T("01:00") },
      { type: "start", taskId: "t2", now: T("01:05") },
    ]);
    expect(data.running?.taskId).toBe("t1");
  });

  it("상태가 안 맞는 일시정지·재개는 아무것도 바꾸지 않는다", () => {
    const start = ready();
    expect(reducer(start, { type: "pause", now: T("01:00") })).toBe(start);
    const running = reducer(start, { type: "start", taskId: "t1", now: T("01:00") });
    expect(reducer(running, { type: "resume", now: T("01:10") })).toBe(running);
  });

  it("0초 구간은 기록으로 남기지 않는다", () => {
    const data = run([
      { type: "start", taskId: "t1", now: T("01:00") },
      { type: "finish", now: T("01:00"), recordIds: ["r1"] },
    ]);
    expect(data.records).toEqual([]);
    expect(data.running).toBeNull();
  });
});

describe("앱을 다시 켰을 때 복구", () => {
  it("남은 타이머를 마지막 확인 시각에서 닫는다", () => {
    const data = run([
      { type: "start", taskId: "t1", now: T("01:00") },
      { type: "touch", now: T("01:40") },
      { type: "recover", recordIds: ["r1"] },
    ]);
    expect(data.records).toEqual([{ id: "r1", taskId: "t1", start: T("01:00"), end: T("01:40") }]);
    expect(data.running).toBeNull();
  });

  it("일시정지 중이던 타이머는 닫힌 구간만 남긴다", () => {
    const data = run([
      { type: "start", taskId: "t1", now: T("01:00") },
      { type: "pause", now: T("01:20") },
      { type: "recover", recordIds: ["r1"] },
    ]);
    expect(data.records).toEqual([{ id: "r1", taskId: "t1", start: T("01:00"), end: T("01:20") }]);
  });
});

describe("하루 목표", () => {
  it("1~1440분으로 맞추고 반올림한다", () => {
    expect(run([{ type: "set-goal", minutes: 0 }]).settings.dailyGoalMinutes).toBe(1);
    expect(run([{ type: "set-goal", minutes: 99999 }]).settings.dailyGoalMinutes).toBe(GOAL_MAX_MINUTES);
    expect(run([{ type: "set-goal", minutes: 90.6 }]).settings.dailyGoalMinutes).toBe(91);
  });

  it("숫자가 아니면 무시한다", () => {
    const start = ready();
    expect(reducer(start, { type: "set-goal", minutes: Number.NaN })).toBe(start);
  });
});

it("읽기 전에는 타이머 동작을 무시한다", () => {
  const loading: TodayState = { kind: "loading" };
  expect(reducer(loading, { type: "start", taskId: "t1", now: T("01:00") })).toBe(loading);
});
