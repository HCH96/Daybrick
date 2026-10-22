import LineIcon from "./LineIcon";

/** 사이드바 메뉴 아이콘 (목업의 SVG) */

export function HomeIcon() {
  return (
    <LineIcon>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </LineIcon>
  );
}

export function CalendarIcon() {
  return (
    <LineIcon>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </LineIcon>
  );
}

export function SchedulerIcon() {
  return (
    <LineIcon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </LineIcon>
  );
}

export function ApplicationsIcon() {
  return (
    <LineIcon>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </LineIcon>
  );
}

export function TimerIcon() {
  return (
    <LineIcon>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4M10 2h4" />
    </LineIcon>
  );
}
