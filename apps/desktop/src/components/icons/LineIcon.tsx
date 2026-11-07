import type { ReactNode } from "react";

interface LineIconProps {
  size?: number;
  children: ReactNode;
}

/** 선으로 그리는 아이콘 틀 (24x24 기준, 기본 16px·선 1.5). 색은 글자색(currentColor)을 따른다. */
function LineIcon({ size = 16, children }: LineIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default LineIcon;
