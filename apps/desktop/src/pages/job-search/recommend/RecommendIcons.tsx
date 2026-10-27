import LineIcon from "../../../components/icons/LineIcon";

/** 추천 공고 탭 아이콘 (목업 icons.js의 i-clock·i-alert·i-sort·i-archive·i-filter 모양) */

export function ClockIcon() {
  return (
    <LineIcon size={13}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </LineIcon>
  );
}

export function AlertIcon() {
  return (
    <LineIcon size={13}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </LineIcon>
  );
}

export function SortIcon() {
  return (
    <LineIcon size={13}>
      <path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" />
    </LineIcon>
  );
}

export function ArchiveIcon() {
  return (
    <LineIcon size={13}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11h14V8M10 12h4" />
    </LineIcon>
  );
}

export function FilterIcon() {
  return (
    <LineIcon size={13}>
      <path d="M3 5h18l-7 8v6l-4 2v-8z" />
    </LineIcon>
  );
}
