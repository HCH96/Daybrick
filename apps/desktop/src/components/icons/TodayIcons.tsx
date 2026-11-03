/**
 * 투데이 목업 아이콘 중 다른 아이콘 파일에 없는 것.
 * 재생 아이콘은 목업 i-play처럼 채운 삼각형이라 LineIcon 대신 채움 SVG로 그린다.
 */

/** 타이머 시작 (칸반 카드 ▶, 목업 i-play) */
export function PlayIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l10.5-6.5z" />
    </svg>
  );
}

/** 주의 (미완료 버튼, 목업 i-alert) */
export function AlertIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16v.5" />
    </svg>
  );
}

/** 막힘 (다른 타이머가 돌 때 칸반 카드 ▶ 자리, 목업 i-lock) */
export function LockIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** 타이머 버튼 아이콘 (목업 timer-running·timer-paused의 tm-btn 그림, 14px) */
export function TimerPauseIcon() {
  return (
    <svg viewBox="0 0 14 14" width={14} height={14} aria-hidden="true">
      <path d="M4.5 2.5v9M9.5 2.5v9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function TimerResumeIcon() {
  return (
    <svg viewBox="0 0 14 14" width={14} height={14} aria-hidden="true">
      <path d="M4 2.5 L11.5 7 L4 11.5 Z" fill="currentColor" />
    </svg>
  );
}

export function TimerDoneIcon() {
  return (
    <svg viewBox="0 0 14 14" width={14} height={14} aria-hidden="true">
      <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function TimerStopIcon() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden="true">
      <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" fill="currentColor" />
    </svg>
  );
}
