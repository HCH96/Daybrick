import LineIcon from "../../../components/icons/LineIcon";

/** 상세 팝업·걸러진 공고·보관함 아이콘 (목업 icons.js의 i-check·i-spark·i-text·i-image·i-zoom·i-briefcase·i-undo 모양) */

export function CheckIcon() {
  return (
    <LineIcon size={12}>
      <path d="M5 12l5 5 9-10" />
    </LineIcon>
  );
}

export function SparkIcon() {
  return (
    <LineIcon size={12}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />
    </LineIcon>
  );
}

export function TextIcon() {
  return (
    <LineIcon size={12}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </LineIcon>
  );
}

export function ImageIcon() {
  return (
    <LineIcon size={12}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-9 9" />
    </LineIcon>
  );
}

export function ZoomIcon() {
  return (
    <LineIcon size={12}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
    </LineIcon>
  );
}

export function BriefcaseIcon() {
  return (
    <LineIcon size={12}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2M3 13h18" />
    </LineIcon>
  );
}

export function UndoIcon() {
  return (
    <LineIcon size={12}>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
    </LineIcon>
  );
}

export function BigAlertIcon() {
  return (
    <LineIcon size={20}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </LineIcon>
  );
}
