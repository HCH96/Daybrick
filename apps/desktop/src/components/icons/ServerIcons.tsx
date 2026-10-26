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

/** 도움말: 동그라미 속 물음표 ("어디서 찾나요?") */
export function HelpIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17v.5" />
    </LineIcon>
  );
}

/** 오류: X */
export function CrossIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </LineIcon>
  );
}

/** 접속 불가: 빗금 친 구름 */
export function CloudOffIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z" />
      <path d="M3 3l18 18" />
    </LineIcon>
  );
}

/** 일시정지: 동그라미 속 두 줄 */
export function PauseIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9v6M14 9v6" />
    </LineIcon>
  );
}

/** 사용자 (이미 세팅된 서버 → 로그인) */
export function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </LineIcon>
  );
}

/** 업데이트: 위쪽 화살표 */
export function ArrowUpIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </LineIcon>
  );
}

/** 값 보기: 눈 */
export function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </LineIcon>
  );
}

/** 값 가리기: 빗금 친 눈 */
export function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3 3l18 18" />
    </LineIcon>
  );
}

export function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </LineIcon>
  );
}

export function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </LineIcon>
  );
}
