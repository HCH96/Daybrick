import type { CSSProperties } from "react";
import Sprite from "./Sprite";

export type SceneMode = "run" | "paused" | "goal" | "goal-paused" | "idle";

interface TrackSceneProps {
  mode: SceneMode;
  /** 오늘 기록 / 목표 (1 이상이면 골인) */
  ratio: number;
  /** 툴팁 "3:20 / 6:00" (R43) */
  tip: string;
  label: string;
}

const TRACK_END = 142;
const TICKS = [14, 28, 43, 57, 71, 85, 99, 114, 128];
const GOAL_LEFT = 92; // 골인 때 캐릭터는 깃발 앞

/** 색종이 8개 (목업 part-timer-goal.html 위치). 한 번만 떨어지고 2초 안에 모두 끝난다 */
const CONFETTI: CSSProperties[] = [
  { left: 96, top: 14, background: "var(--c)", animationDuration: "1.5s" },
  { left: 112, top: 6, width: 3, height: 5, background: "var(--accent)", animationDuration: "1.5s", animationDelay: ".2s" },
  { left: 128, top: 18, height: 3, background: "#f2c94c", animationDuration: "1.4s", animationDelay: ".4s" },
  { left: 150, top: 10, width: 3, height: 3, background: "var(--text)", animationDuration: "1.6s", animationDelay: ".1s" },
  { left: 84, top: 24, width: 3, background: "#f2c94c", animationDuration: "1.3s", animationDelay: ".5s" },
  { left: 120, top: 2, background: "var(--text)", animationDuration: "1.5s", animationDelay: ".3s" },
  { left: 104, top: 26, width: 3, height: 3, background: "var(--accent)", animationDuration: "1.2s", animationDelay: ".6s" },
  { left: 138, top: 4, width: 3, background: "var(--c)", animationDuration: "1.4s", animationDelay: ".5s" },
];

/** 트랙 그림 한 장면 (R42–R46, timer-visual.md). 움직임은 track.css의 장면 클래스가 건다. */
function TrackScene({ mode, ratio, tip, label }: TrackSceneProps) {
  const goal = mode === "goal" || mode === "goal-paused";
  const paused = mode === "paused" || mode === "goal-paused";
  const passedX = goal ? TRACK_END : Math.min(1, Math.max(0, ratio)) * TRACK_END;
  const charLeft = goal ? GOAL_LEFT : Math.min(100, Math.max(0, passedX - 21));
  const zLeft = goal ? 120 : charLeft + 30;
  // 골인+일시정지는 --goal --paused 둘 다 (CSS가 깃발 멈춤·졸기로 덮는다)
  const sceneClass = ["track-scene", goal ? "track-scene--goal" : mode !== "paused" ? `track-scene--${mode}` : "", paused ? "track-scene--paused" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={sceneClass} tabIndex={0} role="img" aria-label={label}>
      {!goal && <Clouds />}
      <svg className="track-scene__layer" width="160" height="130" viewBox="0 0 160 130">
        {passedX < TRACK_END && <line className="track-scene__rest" x1={passedX} y1="113.5" x2={TRACK_END} y2="113.5" />}
        {passedX > 0 && <line className="track-scene__passed" x1="0" y1="113.5" x2={passedX} y2="113.5" />}
        <g className="track-scene__tick">
          {TICKS.map((x) => (
            <rect key={x} x={x} y="119" width="2" height="3" />
          ))}
        </g>
        {goal ? (
          <>
            <rect className="track-scene__pole" x="141" y="38" width="2" height="75" />
            <rect className="track-scene__cap" x="140" y="35" width="4" height="4" />
          </>
        ) : (
          <>
            <rect className="track-scene__pole" x="141" y="62" width="2" height="51" />
            <rect className="track-scene__cap" x="140" y="60" width="4" height="3" />
            <path className="track-scene__flag" d="M143 64 L159 70 L143 76 Z" />
          </>
        )}
      </svg>
      {goal && (
        <svg className="track-scene__flag-wave" width="18" height="14" viewBox="0 0 18 14" style={{ left: 143, top: 40 }}>
          <path className="track-scene__flag" d="M0 0 L17 7 L0 14 Z" />
        </svg>
      )}
      {mode === "run" && (
        <>
          <span className="track-scene__dust" style={{ left: charLeft - 4, top: 106 }} />
          <span className="track-scene__dust track-scene__dust--s" style={{ left: charLeft - 9, top: 101 }} />
        </>
      )}
      {mode === "goal" && <span className="track-scene__shadow" style={{ left: charLeft + 8 }} />}
      <div className="track-scene__char" style={{ left: charLeft }}>
        <SceneSprite mode={mode} />
      </div>
      {paused && (
        <>
          <span className="track-scene__z" style={{ left: zLeft, top: 62, fontSize: 9 }}>z</span>
          <span className="track-scene__z track-scene__z--2" style={{ left: zLeft + 2, top: 60, fontSize: 11 }}>z</span>
          <span className="track-scene__z track-scene__z--3" style={{ left: zLeft + 4, top: 58, fontSize: 13 }}>Z</span>
        </>
      )}
      {mode === "goal" && CONFETTI.map((style, i) => <span key={i} className="track-scene__conf" style={style} />)}
      <span className="track-scene__tip" style={{ left: goal ? 70 : 80 }}>
        {tip}
      </span>
    </div>
  );
}

function SceneSprite({ mode }: { mode: SceneMode }) {
  if (mode === "run")
    return (
      <>
        <Sprite name="run1" className="track-scene__sprite--f1" />
        <Sprite name="run2" className="track-scene__sprite--f2" />
      </>
    );
  if (mode === "goal") return <Sprite name="cheer" />;
  if (mode === "idle") return <Sprite name="stand" />;
  return <Sprite name="sit" />;
}

/** 픽셀 구름 2개 (골인 장면에는 없음) */
function Clouds() {
  return (
    <svg className="track-scene__layer track-scene__cloud" width="160" height="60" viewBox="0 0 160 60" shapeRendering="crispEdges">
      <rect x="104" y="30" width="16" height="4" />
      <rect x="108" y="26" width="8" height="4" />
      <rect x="36" y="16" width="12" height="3" />
      <rect x="39" y="13" width="6" height="3" />
    </svg>
  );
}

export default TrackScene;
