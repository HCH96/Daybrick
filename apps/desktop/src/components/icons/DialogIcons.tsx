import LineIcon from "./LineIcon";

/** 팝업 머리 버튼 아이콘 (지원 관리 목업의 SVG) */

/** 최대화: 바깥으로 벌어지는 화살표 */
export function MaximizeIcon() {
  return (
    <LineIcon size={16}>
      <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
    </LineIcon>
  );
}

/** 원래 크기로: 안으로 모이는 화살표 */
export function RestoreIcon() {
  return (
    <LineIcon size={16}>
      <path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7" />
    </LineIcon>
  );
}

/** 삭제: 휴지통 */
export function TrashIcon() {
  return (
    <LineIcon size={16}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </LineIcon>
  );
}

/** 닫기: X */
export function CloseIcon() {
  return (
    <LineIcon size={16}>
      <path d="M6 6l12 12M18 6L6 18" />
    </LineIcon>
  );
}

/** 저장됨: 체크 */
export function CheckIcon() {
  return (
    <LineIcon size={14}>
      <path d="M5 12l5 5 9-10" />
    </LineIcon>
  );
}
