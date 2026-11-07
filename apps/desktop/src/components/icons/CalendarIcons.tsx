import type { EventKind } from "../../features/applications/types";

/** 캘린더 칩 아이콘 (목업 icons.js의 k-*, f-todo, f-ok) */

interface KindIconProps {
  kind: EventKind;
  className?: string;
}

/** 지원 일정 종류 아이콘 (R14): 면접 = 사람, 코딩테스트 = </>, 과제 마감 = 문서, 지원 마감 = 보내기 */
export function AppKindIcon({ kind, className }: KindIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "interview" && (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c1-4 4-6 7-6s6 2 7 6" />
        </>
      )}
      {kind === "coding-test" && <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />}
      {kind === "assignment-due" && (
        <>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M9 12h6M9 16h4" />
        </>
      )}
      {kind === "application-due" && (
        <>
          <path d="M4 12l16-8-5 16-3-7z" />
          <path d="M12 13l8-9" />
        </>
      )}
    </svg>
  );
}

interface FlagIconProps {
  done: boolean;
  className?: string;
}

/** 체크포인트 깃발 (R15–R16): 앞으로 = 테두리만, 끝남 = 채운 깃발 + 체크. 색은 글자색을 따른다 */
export function FlagIcon({ done, className }: FlagIconProps) {
  return (
    <svg className={className} viewBox="0 0 12 14" aria-hidden="true">
      <path d="M1.5 0.5v13" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
      {done ? (
        <>
          <path d="M2 1h9.5l-1.8 2.9 1.8 2.9H2z" fill="currentColor" />
          <path
            d="M4.4 3.9l1.3 1.3 2.3-2.4"
            fill="none"
            style={{ stroke: "var(--on-accent)" }}
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <path d="M2.2 1.3h8l-1.6 2.6 1.6 2.6h-8z" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
      )}
    </svg>
  );
}
