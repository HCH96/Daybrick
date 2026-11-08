import LineIcon from "./LineIcon";

/**
 * 투데이 목업 아이콘 중 다른 아이콘 파일에 없는 것.
 * 재생·타이머 버튼 아이콘은 채운 모양이라 LineIcon 대신 채움 SVG로 그린다.
 */

/** 타이머 시작 (칸반 카드 ▶, 목업 i-play) */
export function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l10.5-6.5z" />
    </svg>
  );
}

/** 주의 (미완료 버튼, 목업 i-alert) */
export function AlertIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16v.5" />
    </LineIcon>
  );
}

/** 막힘 (다른 타이머가 돌 때 칸반 카드 ▶ 자리, 목업 i-lock) */
export function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </LineIcon>
  );
}

/** 스트릭 불꽃 (오늘 요약 스트릭 타일, 목업 i-flame) */
export function FlameIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.6 2-4.5.2 1.6 1 2.6 2 3 0-3 .3-5.5 1-8.5z" />
    </LineIcon>
  );
}

/** 타이머 버튼 아이콘 (목업 timer-running·timer-paused의 tm-btn 그림). 14 좌표로 그려 16px로 놓는다 */
export function TimerPauseIcon() {
  return (
    <svg viewBox="0 0 14 14" width={16} height={16} aria-hidden="true">
      <path d="M4.5 2.5v9M9.5 2.5v9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function TimerResumeIcon() {
  return (
    <svg viewBox="0 0 14 14" width={16} height={16} aria-hidden="true">
      <path d="M4 2.5 L11.5 7 L4 11.5 Z" fill="currentColor" />
    </svg>
  );
}

export function TimerDoneIcon() {
  return (
    <svg viewBox="0 0 14 14" width={16} height={16} aria-hidden="true">
      <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** 정지: 다른 버튼 그림과 같은 14 좌표 틀에 네모를 가운데 놓는다 */
export function TimerStopIcon() {
  return (
    <svg viewBox="0 0 14 14" width={16} height={16} aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" />
    </svg>
  );
}

/** 오늘로 가져오기 (미완료 팝업, 목업 i-in) */
export function BringInIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M4 12h11M11 7l5 5-5 5M20 4v16" />
    </LineIcon>
  );
}
