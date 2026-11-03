/**
 * 프로젝트 화면 그림 (목업 icons.js의 flag-done·flag-todo·finish·runner·fire-* 심볼을 그대로 옮김).
 * 색이 들어간 그림이라 선 아이콘(LineIcon)과 따로 둔다. 크기는 부르는 쪽 CSS가 정한다.
 */
import type { Fire } from "../../../features/projects/campfire";

/** 끝난 단계 깃발 (프로젝트 색 = currentColor) */
export function FlagDoneArt() {
  return (
    <svg viewBox="0 0 26 40" aria-hidden="true">
      <path d="M1 0v40" stroke="#cdcdd6" strokeWidth="2" />
      <path d="M2 2C8 0 12 5 18 3L25 2V15C19 17 13 12 7 15L2 16Z" fill="currentColor" />
      <path d="M8.5 8.6l2.6 2.6 5-5.4" fill="none" stroke="#17171a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 아직인 단계 깃발 (회색) */
export function FlagTodoArt() {
  return (
    <svg viewBox="0 0 26 40" aria-hidden="true">
      <path d="M1 0v40" stroke="#6b6b78" strokeWidth="2" />
      <path d="M2 2H11L12 17L2 15Z" fill="#2b2b31" stroke="#6b6b78" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** 결승선 체크무늬 깃발 */
export function FinishArt() {
  return (
    <svg viewBox="0 0 22 48" aria-hidden="true">
      <path d="M2 0v48" stroke="#cdcdd6" strokeWidth="2" />
      <rect x="3" y="1" width="18" height="15" fill="#ededf2" />
      <path d="M3 1h4.5v5H3zM12 1h4.5v5H12zM7.5 6H12v5H7.5zM16.5 6H21v5h-4.5zM3 11h4.5v5H3zM12 11h4.5v5H12z" fill="#17171a" />
    </svg>
  );
}

/** 달리는 캐릭터 (프로젝트 색 = currentColor) */
export function RunnerArt() {
  return (
    <svg viewBox="0 0 20 21" aria-hidden="true">
      <ellipse cx="10" cy="20" rx="6" ry="1" fill="rgba(0,0,0,.45)" />
      <path
        d="M8 12L5.5 16.5H2.5M12 12l2 4 3 1.5M4.5 8L1.5 10M15.5 8l3-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="4" y="1" width="12" height="11.5" rx="3" fill="currentColor" />
      <path d="M6 6.5h8M10 1.5v5M7.5 6.5v5.5M12.5 6.5v5.5" stroke="rgba(0,0,0,.18)" strokeWidth="1" />
      <rect x="10" y="3.5" width="2" height="3" rx="1" fill="#17171a" />
      <rect x="13" y="3.5" width="2" height="3" rx="1" fill="#17171a" />
    </svg>
  );
}

function Flame({ scale = 1 }: { scale?: number }) {
  const transform = scale === 1 ? undefined : `translate(24 40) scale(${scale}) translate(-24 -40)`;
  return (
    <g transform={transform}>
      <path
        d="M24 4C31 12 37 19 34.5 29C33 35.5 29 39.5 24 39.5S15 35.5 13.5 29C12 22 17 17 19.5 10.5C21.5 15.5 23.5 16.5 24 19C25 13.5 23 9 24 4Z"
        fill="#ff6a3d"
      />
      <path
        d="M24 14C28.5 19.5 31.5 24 30 30.5C29 35 26.8 38 24 38S19 35 18.2 31C17.4 26.5 20 23 21.5 19.5C22.6 22.5 23.6 23.4 24 25C24.7 21 23.6 17.5 24 14Z"
        fill="#ffa23d"
      />
      <path
        d="M24 24C26.5 27.5 27.8 30.5 27 33.5C26.4 36 25.3 37.5 24 37.5S21.4 36 21 34C20.6 31.5 22 29.5 23 27.5C23.6 29 24 29.5 24.2 30.5C24.5 28.5 23.7 26 24 24Z"
        fill="#ffe07a"
      />
    </g>
  );
}

function Logs({ burnt = false, opacity }: { burnt?: boolean; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <rect x="8" y="37" width="32" height="6.5" rx="3.2" fill={burnt ? "#4a3426" : "#9a6a3e"} transform="rotate(-13 24 40)" />
      <rect x="8" y="37" width="32" height="6.5" rx="3.2" fill={burnt ? "#3b2a20" : "#7c5230"} transform="rotate(13 24 40)" />
    </g>
  );
}

/** 모닥불 6단계 그림 (visual.md 모닥불 단계) */
export function FireArt({ fire }: { fire: Fire }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      {fire === "blaze" && (
        <>
          <circle cx="24" cy="28" r="22" fill="rgba(255,130,60,.16)" />
          <Logs />
          <Flame />
        </>
      )}
      {fire === "mid" && (
        <>
          <circle cx="24" cy="32" r="16" fill="rgba(255,130,60,.12)" />
          <Logs />
          <Flame scale={0.74} />
        </>
      )}
      {fire === "small" && (
        <>
          <circle cx="24" cy="36" r="11" fill="rgba(255,130,60,.10)" />
          <Logs />
          <Flame scale={0.46} />
        </>
      )}
      {fire === "ember" && (
        <>
          <Logs burnt />
          <path d="M15 38.5h5M27 41.5h6M22 43.5h4" stroke="#ff7a3d" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="20" cy="35" r="1.2" fill="#ffa23d" />
          <circle cx="28" cy="33" r="1" fill="#ff6a3d" />
          <circle cx="24" cy="30" r=".8" fill="#ffa23d" opacity=".7" />
        </>
      )}
      {fire === "out" && (
        <>
          <Logs burnt />
          <path
            d="M22 34c-3-3 3-5 0-8s3-5 0-8M27 33c-2.5-2.5 2.5-4 0-6.5s2.5-4 0-6.5"
            fill="none"
            stroke="#6b6b78"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity=".8"
          />
        </>
      )}
      {fire === "wood" && <Logs opacity={0.75} />}
    </svg>
  );
}
