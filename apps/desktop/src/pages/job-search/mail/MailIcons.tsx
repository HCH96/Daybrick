import LineIcon from "../../../components/icons/LineIcon";

/** 메일 제안 탭 아이콘 (목업 icons.js의 i-calendar 모양) */

export function CalendarIcon() {
  return (
    <LineIcon size={12}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </LineIcon>
  );
}
