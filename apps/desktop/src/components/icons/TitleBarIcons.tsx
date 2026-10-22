import type { ReactNode } from "react";
import LineIcon from "./LineIcon";

/* ===== 제목 표시줄 왼쪽 버튼 (18px 선 아이콘) ===== */

export function SidebarToggleIcon() {
  return (
    <LineIcon>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </LineIcon>
  );
}

export function BackIcon() {
  return (
    <LineIcon>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </LineIcon>
  );
}

export function ForwardIcon() {
  return (
    <LineIcon>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </LineIcon>
  );
}

/* ===== 창 버튼 (Windows 기본 모양과 비슷한 10px 가는 선) ===== */

function WindowIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 10 10"
      width={10}
      height={10}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function MinimizeIcon() {
  return (
    <WindowIcon>
      <path d="M0 5.5h10" />
    </WindowIcon>
  );
}

export function MaximizeIcon() {
  return (
    <WindowIcon>
      <rect x="0.5" y="0.5" width="9" height="9" />
    </WindowIcon>
  );
}

/** 최대화 상태에서 "이전 크기로" (겹친 네모) */
export function RestoreIcon() {
  return (
    <WindowIcon>
      <rect x="0.5" y="2.5" width="7" height="7" />
      <path d="M2.5 2.5V0.5h7v7h-2" />
    </WindowIcon>
  );
}

export function CloseIcon() {
  return (
    <WindowIcon>
      <path d="M0.5 0.5l9 9M9.5 0.5l-9 9" />
    </WindowIcon>
  );
}
