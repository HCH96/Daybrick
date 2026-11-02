import LineIcon from "./LineIcon";

/**
 * 플랜 목업 아이콘 중 CommonIcons에 없는 것.
 * 더하기·접기(아래 화살표)·더보기·펼침(오른쪽 화살표)은 CommonIcons의 PlusIcon·ChevronDownIcon·DotsIcon·ChevronRightIcon을 쓴다.
 */

/** 체크 표시 목록 (빈 목록 안내, 체크리스트 진행도) */
export function ChecklistIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M10 6h10M10 12h10M10 18h10M3.5 6l1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17" />
    </LineIcon>
  );
}
