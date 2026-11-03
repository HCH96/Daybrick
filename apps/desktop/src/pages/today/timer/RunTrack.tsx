import { formatClock } from "../../../features/today/format";
import { dayTotal } from "../../../features/today/stats";
import type { RunningTimer, TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";
import TrackScene, { type SceneMode } from "./TrackScene";
import "./track.css";

interface RunTrackProps {
  data: TodayData;
  todayKey: string;
  /** 없으면 빈 상태(서 있기) */
  running: RunningTimer | null;
}

/**
 * 하루 목표 달리기 트랙 (R42–R46). 진행률 = 오늘 전체 기록(지금 세션 포함) / 하루 목표.
 * 달리는 중에만 1초마다 다시 계산해서, 100%를 넘으면 그 자리에서 골인 장면으로 바뀐다 (R45, D6).
 */
function RunTrack({ data, todayKey, running }: RunTrackProps) {
  const now = useNow(running?.state === "running");
  const total = dayTotal(data, todayKey, now);
  const goalMs = Math.max(1, data.settings.dailyGoalMinutes) * 60000;
  const ratio = total / goalMs;
  const reached = ratio >= 1;

  let mode: SceneMode = "idle";
  if (running) {
    if (running.state === "paused") mode = reached ? "goal-paused" : "paused";
    else mode = reached ? "goal" : "run";
  }

  const tip = `${formatClock(total)} / ${formatClock(goalMs)}`;
  return <TrackScene mode={mode} ratio={ratio} tip={tip} label={`오늘 기록 / 목표 ${tip}, ${LABELS[mode]}`} />;
}

const LABELS: Record<SceneMode, string> = {
  run: "달리는 중",
  paused: "일시정지, 그 자리에서 쉬는 중",
  goal: "목표 달성, 골인",
  "goal-paused": "일시정지, 목표 달성 뒤 깃발 앞에서 쉬는 중",
  idle: "타이머 없음, 오늘 진행 위치에 서 있음",
};

export default RunTrack;
