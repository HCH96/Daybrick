import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePlan } from "../../../features/plan/store";
import type { Project } from "../../../features/plan/types";

/** 캐릭터가 결승까지 달려가는 시간(FlagTrack 전환 0.9초)보다 조금 길게 */
const RUNNER_MS = 950;
/** 완료된 프로젝트를 열었을 때: 화면이 그려진 뒤 잠깐 있다가 */
const OPEN_DELAY_MS = 300;
/** 색종이·배지가 보이는 시간 */
const CELEBRATE_MS = 1600;

/**
 * 골인 연출을 틀지 정한다 (프로젝트 R25).
 * 완료인데 본 시각(`goalSeenAt`)이 비어 있으면 한 번 튼다: 보는 중에 완료가 되면 캐릭터가 결승에 닿은 뒤,
 * 이미 완료된 프로젝트를 열었으면 바로. 끝나면 본 시각을 적는다(다시 진행 중이 되면 useGoalReset이 비운다, R18).
 * 도중에 상세를 떠나면 적지 않으므로 다음에 열 때 다시 나온다.
 */
export function useGoalCelebration(project: Project, done: boolean): boolean {
  const { setGoalSeen } = usePlan();
  const markSeen = useRef(setGoalSeen);
  markSeen.current = setGoalSeen;
  const [playing, setPlaying] = useState(false);
  // 보는 동안 한 번이라도 진행 중이었으면, 완료되는 순간 캐릭터가 달려가는 중이다
  const sawUndone = useRef(!done);
  const pending = done && project.goalSeenAt === null;
  const id = project.id;

  useEffect(() => {
    if (!done) sawUndone.current = true;
  }, [done]);

  useEffect(() => {
    if (!pending) return;
    let end = 0;
    const start = window.setTimeout(
      () => {
        setPlaying(true);
        end = window.setTimeout(() => {
          setPlaying(false);
          markSeen.current(id, new Date().toISOString());
        }, CELEBRATE_MS);
      },
      sawUndone.current ? RUNNER_MS : OPEN_DELAY_MS,
    );
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(end);
      setPlaying(false);
    };
  }, [pending, id]);

  return playing;
}

/** 색종이 조각 수와 색 (프로젝트 색 + 밝은 색 몇 개) */
const PIECES = 26;
const CONFETTI_COLORS = ["var(--c)", "#ffd166", "#7bd88f", "#7cc4ff", "#ff8fab", "#c9a7ff"];

/**
 * 골인 연출 그림 (프로젝트 R25): 결승선 위에서 색종이가 터져 흩어지고 "골인!" 배지가 뜬다.
 * 결승 깃발 펄럭임은 진행 판 트랙의 `proj-progress__track--goal` 클래스로 한다 (Detail.css).
 * 조각 자리는 번호로 정해 다시 그려도 같은 모양이다.
 */
function GoalCelebration() {
  return (
    <div className="proj-goal" aria-live="polite">
      <div className="proj-goal__burst" aria-hidden="true">
        {Array.from({ length: PIECES }, (_, i) => {
          const spread = ((i * 37) % 100) / 100; // 0–1 사이로 고르게 섞기
          const style = {
            "--x": `${Math.round((spread - 0.75) * 260)}px`,
            "--y": `${40 + ((i * 53) % 60)}px`,
            "--r": `${(i * 71) % 360}deg`,
            "--d": `${(i % 6) * 0.05}s`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          } as CSSProperties;
          return <i key={i} style={style} />;
        })}
      </div>
      <span className="proj-goal__badge">골인!</span>
    </div>
  );
}

export default GoalCelebration;
