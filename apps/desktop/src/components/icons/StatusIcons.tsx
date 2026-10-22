import LineIcon from "./LineIcon";

/** 아직 연결되지 않은 카드: 쌓인 벽돌 */
export function BricksIcon() {
  return (
    <LineIcon size={20}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.33h18M3 14.67h18M12 4v5.33M7.5 9.33v5.34M16.5 9.33v5.34M12 14.67V20" />
    </LineIcon>
  );
}

/** 추가: 더하기 */
export function PlusIcon() {
  return (
    <LineIcon size={16}>
      <path d="M12 5v14M5 12h14" />
    </LineIcon>
  );
}

/** 준비 중인 화면: 렌치 */
export function WrenchIcon() {
  return (
    <LineIcon size={20}>
      <path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6a6 6 0 0 1-7.5 1.2L6 21.3a2 2 0 0 1-2.8-2.8l7.5-7.5A6 6 0 0 1 11.4 3l1.3 1.3a4 4 0 0 0 2 2z" />
    </LineIcon>
  );
}
