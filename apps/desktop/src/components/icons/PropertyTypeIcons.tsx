import type { ReactNode } from "react";
import type { PropertyType } from "../../features/applications/types";
import LineIcon from "./LineIcon";

/** 속성 종류 아이콘 7가지 (지원 관리 목업의 SVG) */
const PATHS: Record<PropertyType, ReactNode> = {
  text: <path d="M5 6h14M12 6v13M9 19h6" />,
  number: <path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16" />,
  select: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 11l4 4 4-4" />
    </>
  ),
  "multi-select": (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </>
  ),
  date: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  url: (
    <>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </>
  ),
  checkbox: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
};

export function PropertyTypeIcon({ type, size = 15 }: { type: PropertyType; size?: number }) {
  return <LineIcon size={size}>{PATHS[type]}</LineIcon>;
}
