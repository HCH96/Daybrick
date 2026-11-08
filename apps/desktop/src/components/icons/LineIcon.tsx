import type { ReactNode } from "react";

interface LineIconProps {
  size?: number;
  className?: string;
  children: ReactNode;
}

/**
 * 선으로 그리는 아이콘 틀 (24x24 기준). 색은 글자색(currentColor)을 따른다.
 * 크기는 12(작은 글자·칩 옆)와 16(버튼·메뉴 줄 등 기본)을 쓴다.
 * 선 굵기는 화면에서 1px로 보이게 크기에 맞춘다: 16px은 1.5, 12px 이하는 2.
 */
function LineIcon({ size = 16, className, children }: LineIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={size <= 12 ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default LineIcon;
