/**
 * 프로젝트별 시간 값 훅 (프로젝트 R26·R28, D9).
 * 플랜·투데이 데이터와 지금 시각으로 누적·이번 주·마지막 작업일·날짜별 합(잔디)을 계산한다.
 * 타이머가 도는 동안만 10초마다 다시 계산하고, 분 단위 값이 그대로면 앞의 객체를 그대로 돌려준다
 * (카드가 10초마다 다시 그려지지 않게).
 */
import { useMemo, useRef } from "react";
import { startOfWeek } from "../../utils/date";
import { usePlan } from "../plan/store";
import { useToday } from "../today/store";
import { useNow } from "../today/useNow";
import { useTodayKey } from "../today/useTodayKey";
import { dayTotalsByProject, lastWorkDay, taskProjectMap } from "./time";

/** 프로젝트 하나의 시간 값 (밀리초는 분 단위로 내림) */
export interface ProjectTime {
  total: number;
  week: number;
  lastDay: string | null;
}

export interface ProjectClock {
  todayKey: string;
  /** 프로젝트 id → 시간 값. 기록이 없는 프로젝트는 없다 (EMPTY_TIME으로 본다) */
  byProject: Map<string, ProjectTime>;
  /** 프로젝트 id → ("YYYY-MM-DD" → 밀리초, 분 단위로 내림). 잔디·칸 말풍선용 (R54–R59) */
  days: Map<string, Map<string, number>>;
  /** 실제로 도는(일시정지 아님) 타이머의 프로젝트 id */
  runningProjectId: string | null;
}

export const EMPTY_TIME: ProjectTime = { total: 0, week: 0, lastDay: null };

const TICK_MS = 10_000;
const MINUTE = 60_000;

function floorMinute(ms: number): number {
  return Math.floor(ms / MINUTE) * MINUTE;
}

export function useProjectClock(): ProjectClock {
  const planState = usePlan().state;
  const todayState = useToday().state;
  const todayKey = useTodayKey();
  const plan = planState.kind === "ready" ? planState.data : null;
  const today = todayState.kind === "ready" ? todayState.data : null;
  const ticking = today?.running?.state === "running";
  const now = useNow(ticking, TICK_MS);

  const next = useMemo<ProjectClock>(() => {
    const byProject = new Map<string, ProjectTime>();
    const dayMap = new Map<string, Map<string, number>>();
    if (!plan || !today) return { todayKey, byProject, days: dayMap, runningProjectId: null };
    const weekStart = startOfWeek(todayKey);
    for (const [projectId, days] of dayTotalsByProject(plan, today, now)) {
      let total = 0;
      let week = 0;
      const floored = new Map<string, number>();
      for (const [day, ms] of days) {
        total += ms;
        floored.set(day, floorMinute(ms));
        if (day >= weekStart && day <= todayKey) week += ms;
      }
      byProject.set(projectId, { total: floorMinute(total), week: floorMinute(week), lastDay: lastWorkDay(days) });
      dayMap.set(projectId, floored);
    }
    const running = today.running;
    const runningProjectId =
      running && running.state === "running" ? (taskProjectMap(plan).get(running.taskId) ?? null) : null;
    return { todayKey, byProject, days: dayMap, runningProjectId };
  }, [plan, today, todayKey, now]);

  // 분 단위 값이 같으면 앞의 객체를 그대로 쓴다 (D9)
  const previous = useRef<ProjectClock | null>(null);
  if (previous.current === null || !sameClock(previous.current, next)) previous.current = next;
  return previous.current;
}

function sameClock(a: ProjectClock, b: ProjectClock): boolean {
  if (a.todayKey !== b.todayKey || a.runningProjectId !== b.runningProjectId) return false;
  if (a.byProject.size !== b.byProject.size) return false;
  for (const [id, x] of a.byProject) {
    const y = b.byProject.get(id);
    if (!y || x.total !== y.total || x.week !== y.week || x.lastDay !== y.lastDay) return false;
  }
  if (a.days.size !== b.days.size) return false;
  for (const [id, x] of a.days) {
    const y = b.days.get(id);
    if (!y || x.size !== y.size) return false;
    for (const [day, ms] of x) if (y.get(day) !== ms) return false;
  }
  return true;
}
