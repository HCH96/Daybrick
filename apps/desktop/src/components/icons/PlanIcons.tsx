import LineIcon from "./LineIcon";

/**
 * 플랜 목업 아이콘 중 CommonIcons에 없는 것.
 * 더하기·접기(아래 화살표)·더보기·펼침(오른쪽 화살표)·체크는 CommonIcons의 PlusIcon·ChevronDownIcon·DotsIcon·ChevronRightIcon·SmallCheckIcon을 쓴다.
 */

/** 체크 표시 목록 (빈 목록 안내, 체크리스트 진행도) */
export function ChecklistIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M10 6h10M10 12h10M10 18h10M3.5 6l1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17" />
    </LineIcon>
  );
}

/** 태스크 종류 (상세 팝업 머리, 목업 i-plan: 달력 + 체크) */
export function TaskIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4M9 15l2 2 4-4" />
    </LineIcon>
  );
}

/** 날짜 (상세 팝업 기간 줄·날짜 칩, 목업 i-cal) */
export function DateIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </LineIcon>
  );
}

/** 깃발 (프로젝트 체크포인트, 목업 i-flag) */
export function FlagIcon({ size = 12 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M5 21V4h11l-2 4 2 4H5" />
    </LineIcon>
  );
}

/** 메모 (상세 팝업 메모 머리, 목업 i-note) */
export function NoteIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M4 5h16M4 10h16M4 15h10M4 20h6" />
    </LineIcon>
  );
}

/** 지원 카드 연결 (상세 팝업 속성 줄·목록 줄 연결 회사, 목업 i-link) */
export function LinkIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </LineIcon>
  );
}

/** 찾기 (지원 카드 고르기 찾기칸, 목업 i-search) */
export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </LineIcon>
  );
}
