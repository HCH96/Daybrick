import { useMemo, type CSSProperties } from "react";
import { formatLastWork } from "../../../features/projects/campfire";
import {
  dayBreakdown,
  heatCells,
  heatEnd,
  heatMonths,
  heatStart,
  longestStreak,
  recentDays,
  streak,
  sumDays,
  totalBetween,
  worked,
  workedDaysBetween,
} from "../../../features/projects/heat";
import { lastWorkDay } from "../../../features/projects/time";
import type { ProjectClock } from "../../../features/projects/useProjectClock";
import type { PlanData } from "../../../features/plan/types";
import HeatGrid from "./HeatGrid";
import HeatStats, { type HeatStatsValue } from "./HeatStats";
import HeatTooltip, { type HeatTipRow } from "./HeatTooltip";
import type { TopHighlight } from "./useTopHighlight";
import "./Heat.css";

interface HeatPanelProps {
  data: PlanData;
  clock: ProjectClock;
  highlight: TopHighlight;
  onHoverDay: (day: string | null) => void;
}

/**
 * 목록 윗줄 왼쪽 "최근 활동" 잔디 판 (프로젝트 R2·R54–R59, D4).
 * 버블 원·범례에 마우스가 있으면 그 프로젝트 시간·색으로 다시 칠하고 숫자도 그 프로젝트 값으로 바꾼다.
 */
function HeatPanel({ data, clock, highlight, onHoverDay }: HeatPanelProps) {
  const { todayKey } = clock;
  const solo = highlight.projectId ? data.projects.find((p) => p.id === highlight.projectId) : undefined;
  const soloId = solo?.id ?? null;
  const days = useMemo(() => sumDays(clock.days, soloId), [clock.days, soloId]);
  const cells = useMemo(() => heatCells(days, todayKey), [days, todayKey]);
  const months = useMemo(() => heatMonths(todayKey), [todayKey]);
  const ticking = clock.runningProjectId !== null && (soloId === null || soloId === clock.runningProjectId);

  const stats = useMemo<HeatStatsValue>(() => {
    if (soloId !== null) {
      const start = heatStart(todayKey);
      const end = heatEnd(todayKey);
      return {
        kind: "project",
        workedDays: workedDaysBetween(days, start, end),
        totalMs: totalBetween(days, start, end),
        lastWork: formatLastWork(lastWorkDay(days), todayKey),
      };
    }
    const count = streak(days, todayKey);
    return {
      kind: "all",
      streak: count,
      longest: longestStreak(days, todayKey),
      risk: count > 0 && !worked(days, todayKey),
      recent: recentDays(days, todayKey),
      todayMs: days.get(todayKey) ?? 0,
      running: clock.runningProjectId !== null,
    };
  }, [soloId, days, todayKey, clock.runningProjectId]);

  const tipRows = useMemo<HeatTipRow[]>(() => {
    if (highlight.dayKey === null) return [];
    return dayBreakdown(clock.days, highlight.dayKey).flatMap(({ projectId, ms }) => {
      const project = data.projects.find((p) => p.id === projectId);
      return project ? [{ projectId, name: project.name, color: project.color, ms }] : [];
    });
  }, [clock.days, highlight.dayKey, data.projects]);

  return (
    <section className="proj-panel proj-heat">
      <div className="proj-panel__head">
        <b>최근 활동</b>
        {solo ? (
          <span className="proj-heat__chip" style={{ "--c": solo.color } as CSSProperties}>
            <span className="proj-heat__dot" />
            {solo.name}만
          </span>
        ) : (
          <>
            <span>최근 16주 · 모든 프로젝트</span>
            <span className="proj-heat__legend proj-panel__right" aria-hidden="true">
              적음
              <i />
              <i className="l1" />
              <i className="l2" />
              <i className="l3" />
              <i className="l4" />
              많음
            </span>
          </>
        )}
      </div>
      <div className="proj-heat__wrap">
        <HeatGrid
          cells={cells}
          months={months}
          color={solo?.color ?? null}
          ticking={ticking}
          hoverDay={highlight.dayKey}
          onHoverDay={onHoverDay}
          tip={highlight.dayKey !== null ? <HeatTooltip day={highlight.dayKey} rows={tipRows} /> : null}
        />
        <HeatStats value={stats} />
      </div>
    </section>
  );
}

export default HeatPanel;
