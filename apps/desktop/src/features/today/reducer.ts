import type { RunningTimer, TimeRecord, TodayData } from "./types";

/** 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 (플랜과 같은 흐름) */
export type TodayState =
  | { kind: "loading" }
  | { kind: "ready"; data: TodayData }
  | { kind: "error"; message: string };

/**
 * reducer에 보내는 동작. id·시각처럼 매번 달라지는 값은 보내는 쪽에서 만들어 넣는다.
 * 시각(now)은 ISO 문자열이다.
 */
export type TodayAction =
  | { type: "loaded"; data: TodayData }
  | { type: "load-failed"; message: string }
  /** 타이머를 만들고 첫 구간을 연다. 이미 도는 타이머가 있으면 무시 (R17) */
  | { type: "start"; taskId: string; now: string }
  /** 열린 구간을 닫는다 (R18) */
  | { type: "pause"; now: string }
  /** 새 구간을 연다 (R18) */
  | { type: "resume"; now: string }
  /**
   * 구간들을 기록으로 옮기고 타이머를 비운다 (완료·중단 공통, R19·R20).
   * recordIds는 구간 수만큼 보내는 쪽에서 만든다. 0초 구간은 버린다.
   */
  | { type: "finish"; now: string; recordIds: string[] };

export function reducer(state: TodayState, action: TodayAction): TodayState {
  switch (action.type) {
    case "loaded":
      return { kind: "ready", data: action.data };
    case "load-failed":
      return { kind: "error", message: action.message };
    default: {
      if (state.kind !== "ready") return state;
      const data = timerReducer(state.data, action);
      return data === state.data ? state : { kind: "ready", data };
    }
  }
}

type TimerAction = Extract<TodayAction, { type: "start" | "pause" | "resume" | "finish" }>;

function timerReducer(data: TodayData, action: TimerAction): TodayData {
  const running = data.running;
  switch (action.type) {
    case "start": {
      if (running !== null) return data;
      const next: RunningTimer = {
        taskId: action.taskId,
        state: "running",
        segments: [{ start: action.now, end: null }],
        lastSeenAt: action.now,
      };
      return { ...data, running: next };
    }
    case "pause": {
      if (running === null || running.state !== "running") return data;
      const segments = running.segments.map((s) => (s.end === null ? { ...s, end: action.now } : s));
      return { ...data, running: { ...running, state: "paused", segments, lastSeenAt: action.now } };
    }
    case "resume": {
      if (running === null || running.state !== "paused") return data;
      const segments = [...running.segments, { start: action.now, end: null }];
      return { ...data, running: { ...running, state: "running", segments, lastSeenAt: action.now } };
    }
    case "finish": {
      if (running === null) return data;
      const added: TimeRecord[] = [];
      running.segments.forEach((s, i) => {
        const end = s.end ?? action.now;
        if (Date.parse(end) - Date.parse(s.start) <= 0) return; // 0초 구간은 버린다
        added.push({ id: action.recordIds[i] ?? `${running.taskId}-${s.start}`, taskId: running.taskId, start: s.start, end });
      });
      return { ...data, records: [...data.records, ...added], running: null };
    }
  }
}
