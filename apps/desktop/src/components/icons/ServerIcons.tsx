import LineIcon from "./LineIcon";

/** 서버 연결 화면 아이콘 (서버 연결 목업의 SVG) */

export function ServerIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </LineIcon>
  );
}
