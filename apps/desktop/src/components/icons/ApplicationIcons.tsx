import LineIcon from "./LineIcon";

/** 지원 관리 화면 아이콘 (목업의 SVG) */

/** 회사: 건물 */
export function BuildingIcon() {
  return (
    <LineIcon size={15}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M10 21v-4h4v4" />
    </LineIcon>
  );
}

/** 정렬: 아래 화살표 + 짧아지는 줄 */
export function SortIcon() {
  return (
    <LineIcon size={15}>
      <path d="M7 4v16M3 16l4 4 4-4M14 6h7M14 12h5M14 18h3" />
    </LineIcon>
  );
}
