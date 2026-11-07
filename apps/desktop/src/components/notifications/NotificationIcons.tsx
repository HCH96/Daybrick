import LineIcon from "../icons/LineIcon";

/* 알림 패널 아이콘 (목업 icons.js와 같은 모양, 24x24 선 아이콘) */

interface IconProps {
  size?: number;
}

/** 주의 알림 표시 (R23) */
export function WarnIcon({ size = 16 }: IconProps) {
  return (
    <LineIcon size={size}>
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.2v.1" />
    </LineIcon>
  );
}

/** 확인 버튼 ✓, 안 읽음 빈 상태 */
export function CheckIcon({ size = 16 }: IconProps) {
  return (
    <LineIcon size={size}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </LineIcon>
  );
}

/** 안 읽음으로 되돌리기 버튼 ↺ */
export function UndoIcon({ size = 16 }: IconProps) {
  return (
    <LineIcon size={size}>
      <path d="M4 5v5h5" />
      <path d="M4.5 10A8 8 0 1 1 6 16.5" />
    </LineIcon>
  );
}

/** [모두 확인] 두 겹 체크 */
export function CheckAllIcon({ size = 14 }: IconProps) {
  return (
    <LineIcon size={size}>
      <path d="M2 12.5l4.5 4.5L16 7.5" />
      <path d="M12 16l1 1 9.5-9.5" />
    </LineIcon>
  );
}

/** 알림 없음 빈 상태의 종 */
export function EmptyBellIcon({ size = 16 }: IconProps) {
  return (
    <LineIcon size={size}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </LineIcon>
  );
}
