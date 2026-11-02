import LineIcon from "./LineIcon";

/** 여러 화면에서 같이 쓰는 작은 아이콘 (지원 관리 목업의 SVG) */

export function ChevronLeftIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M15 6l-6 6 6 6" />
    </LineIcon>
  );
}

export function ChevronRightIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M9 6l6 6-6 6" />
    </LineIcon>
  );
}

export function ChevronDownIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M6 9l6 6 6-6" />
    </LineIcon>
  );
}

export function PlusIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M12 5v14M5 12h14" />
    </LineIcon>
  );
}

/** 고치기: 연필 (플랜 목업) */
export function PenIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
    </LineIcon>
  );
}

/** 끌어 옮기기 손잡이: 점 여섯 개 (플랜 목업) */
export function GripIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </LineIcon>
  );
}

export function SmallCheckIcon({ size = 15 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M5 12l5 5 9-10" />
    </LineIcon>
  );
}

export function SmallCloseIcon({ size = 12 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </LineIcon>
  );
}

/** 더보기: 가로 점 세 개 */
export function DotsIcon({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

/** 바깥으로 열기: 상자 + 오른쪽 위 화살표 */
export function ExternalLinkIcon({ size = 14 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </LineIcon>
  );
}
