import LineIcon from "./LineIcon";

/** 보기 전환 아이콘 (지원 관리 목업의 SVG) */

/** 갤러리: 네 칸 바둑판 */
export function GridIcon() {
  return (
    <LineIcon size={15}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </LineIcon>
  );
}

/** 달력 (작은 크기) */
export function SmallCalendarIcon() {
  return (
    <LineIcon size={15}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </LineIcon>
  );
}
