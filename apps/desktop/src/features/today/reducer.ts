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
  | { type: "finish"; now: string; recordIds: string[] }
  /** 마지막 확인 시각만 지금으로 적는다 (R25, 1분 확인) */
  | { type: "touch"; now: string }
  /**
   * 지난 실행에서 남은 타이머를 마지막 확인 시각(lastSeenAt)에서 닫아 기록으로 옮기고 비운다 (R24, R25, D9).
   * 열린 구간이 lastSeenAt보다 늦게 시작했으면 0초 이하라 버려진다.
   */
  | { type: "recover"; recordIds: string[] };

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

type TimerAction = Extract<TodayAction, { type: "start" | "pause" | "resume" | "finish" | "touch" | "recover" }>;

/** 실행 중 타이머가 있으면 lastSeenAt을 now로 적은 데이터를 돌려준다. 없으면 그대로. 창 닫기 저장도 이것을 쓴다 (D9). */
export function touchRunning(data: TodayData, now: string): TodayData {
  if (data.running === null) return data;
  return { ...data, running: { ...data.running, lastSeenAt: now } };
}

/** 구간들을 now에서 닫아 기록으로 옮기고 타이머를 비운다. 0초 이하 구간은 버린다. */
function finishRunning(data: TodayData, now: string, recordIds: string[]): TodayData {
  const running = data.running;
  if (running === null) return data;
  const added: TimeRecord[] = [];
  running.segments.forEach((s, i) => {
    const end = s.end ?? now;
    if (Date.parse(end) - Date.parse(s.start) <= 0) return; // 0초 구간은 버린다
    added.push({ id: recordIds[i] ?? `${running.taskId}-${s.start}`, taskId: running.taskId, start: s.start, end });
  });
  return { ...data, records: [...data.records, ...added], running: null };
}

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
    case "finish":
      return finishRunning(data, action.now, action.recordIds);
    case "touch":
      return touchRunning(data, action.now);
    case "recover":
      return running === null ? data : finishRunning(data, running.lastSeenAt, action.recordIds);
  }
}
