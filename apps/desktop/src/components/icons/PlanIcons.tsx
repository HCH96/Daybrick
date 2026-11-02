import LineIcon from "./LineIcon";

/**
 * 플랜 목업 아이콘 중 CommonIcons에 없는 것.
 * 더하기·접기(아래 화살표)·더보기·펼침(오른쪽 화살표)·체크는 CommonIcons의 PlusIcon·ChevronDownIcon·DotsIcon·ChevronRightIcon·SmallCheckIcon을 쓴다.
 */

/** 체크 표시 목록 (빈 목록 안내, 체크리스트 진행도) */
export function ChecklistIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M10 6h10M10 12h10M10 18h10M3.5 6l1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17" />
    </LineIcon>
  );
}

/** 태스크 종류 (상세 팝업 머리, 목업 i-plan: 달력 + 체크) */
export function TaskIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4M9 15l2 2 4-4" />
    </LineIcon>
  );
}

/** 날짜 (상세 팝업 기간 줄·날짜 칩, 목업 i-cal) */
export function DateIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </LineIcon>
  );
}

/** 지원 마감 (달력 지원 일정 알약, 목업 i-flag) */
export function FlagIcon({ size = 12 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M5 21V4h11l-2 4 2 4H5" />
    </LineIcon>
  );
}

/** 과제 마감 (목업 i-file) */
export function FileIcon({ size = 12 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </LineIcon>
  );
}

/** 코딩테스트 (목업 i-code) */
export function CodeIcon({ size = 12 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
    </LineIcon>
  );
}

/** 면접 (목업 i-users) */
export function PeopleIcon({ size = 12 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
    </LineIcon>
  );
}

/** 메모 (상세 팝업 메모 머리, 목업 i-note) */
export function NoteIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M4 5h16M4 10h16M4 15h10M4 20h6" />
    </LineIcon>
  );
}
