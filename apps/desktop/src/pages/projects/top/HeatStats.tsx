import { formatBubbleTime } from "../../../features/projects/bubbleScale";
import { fireByStreak } from "../../../features/projects/campfire";
import Campfire from "../common/Campfire";

const MINUTE = 60_000;

/** 모든 프로젝트 기준 숫자 (R55·R57) */
export interface AllStats {
  kind: "all";
  streak: number;
  longest: number;
  /** 오늘 기록이 아직 없고 어제까지 연속 */
  risk: boolean;
  recent: number;
  todayMs: number;
  running: boolean;
}

/** 한 프로젝트로 거른 숫자 (R58) */
export interface ProjectStats {
  kind: "project";
  workedDays: number;
  totalMs: number;
  lastWork: string;
}

export type HeatStatsValue = AllStats | ProjectStats;

/** 잔디 오른쪽 숫자 (프로젝트 R55·R57·R58) */
function HeatStats({ value }: { value: HeatStatsValue }) {
  if (value.kind === "project") {
    return (
      <div className="proj-heat__stats">
        <div className="proj-hs">
          <small>작업한 날 (16주)</small>
          <b>
            {value.workedDays}
            <em>일</em>
          </b>
        </div>
        <div className="proj-hs">
          <small>이 기간 합계</small>
          <b>{formatBubbleTime(Math.floor(value.totalMs / MINUTE))}</b>
        </div>
        <div className="proj-hs">
          <small>마지막 작업</small>
          <b>{value.lastWork}</b>
        </div>
      </div>
    );
  }

  return (
    <div className="proj-heat__stats">
      <div className={`proj-heat__streak${value.risk ? " is-risk" : ""}${value.running ? " is-live" : ""}`}>
        {/* 오늘 기록 전이면 흐린 작은 불, 타이머가 돌 때만 일렁인다 (목업 heat-risk) */}
        <Campfire fire={value.risk ? "small" : fireByStreak(value.streak)} size={40} />
        <div className="proj-hs">
          <small>{value.risk ? "연속 작업 (어제까지)" : "연속 작업"}</small>
          <b>
            {value.streak}
            <em>{value.risk ? "일" : "일째"}</em>
          </b>{" "}
          <span className="proj-hs__sub">
            {value.risk ? `오늘 하면 ${value.streak + 1}일째` : `최장 ${value.longest}일`}
          </span>
        </div>
      </div>
      <div className="proj-hs">
        <small>최근 4주 작업한 날</small>
        <b>
          {value.recent}
          <em>/ 28일</em>
        </b>
      </div>
      <div className="proj-hs">
        <small>오늘</small>
        <b>{formatBubbleTime(Math.floor(value.todayMs / MINUTE))}</b>
        {value.running && <span className="proj-live">진행 중</span>}
      </div>
    </div>
  );
}

export default HeatStats;
