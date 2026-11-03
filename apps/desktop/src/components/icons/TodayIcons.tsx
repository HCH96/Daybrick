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
