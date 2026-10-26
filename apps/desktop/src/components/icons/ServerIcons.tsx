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

export function KeyIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M17 6l3 3M14 9l2 2" />
    </LineIcon>
  );
}

/** Google 로고를 선으로 그린 것 (목업 i-google) */
export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7z" />
      <path d="M12 21c2.6 0 4.7-.9 6.3-2.3l-3.1-2.4c-.9.6-2 .9-3.2.9-2.5 0-4.6-1.7-5.3-3.9H3.5v2.5A9 9 0 0 0 12 21z" />
      <path d="M6.7 13.3a5.4 5.4 0 0 1 0-3.5V7.3H3.5a9 9 0 0 0 0 8.1z" />
      <path d="M12 6.6c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9 9 0 0 0 3.5 7.3l3.2 2.5C7.4 8.3 9.5 6.6 12 6.6z" />
    </LineIcon>
  );
}

export function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </LineIcon>
  );
}

export function WarnIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18v.5" />
    </LineIcon>
  );
}

/** 다음 단계로: 오른쪽 화살표 */
export function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </LineIcon>
  );
}
