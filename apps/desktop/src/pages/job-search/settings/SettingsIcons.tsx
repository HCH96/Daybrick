import LineIcon from "../../../components/icons/LineIcon";

/** 설정 탭 판 제목 아이콘 (목업 icons.js의 i-mail·i-spark·i-clock·i-list 모양) */

export function MailIcon() {
  return (
    <LineIcon size={16}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </LineIcon>
  );
}

export function SparkIcon() {
  return (
    <LineIcon size={16}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </LineIcon>
  );
}

export function ClockIcon() {
  return (
    <LineIcon size={16}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </LineIcon>
  );
}

export function ListIcon() {
  return (
    <LineIcon size={16}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </LineIcon>
  );
}
