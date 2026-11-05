/** 지원 일정 칩의 회사 이니셜 배지 (R13, D3). 인터넷 요청 없이 이름만으로 글자와 색을 정한다. */

/** 배지 색 개수 (Chips.css의 .cal-ini--1 ~ --7) */
export const BADGE_COLOR_COUNT = 7;

/** 이름의 첫 글자 (공백 제외). 이름이 비어 있으면 "?" */
export function badgeInitial(name: string): string {
  const first = Array.from(name.replace(/\s+/g, ""))[0];
  return first ? first.toUpperCase() : "?";
}

/**
 * 배지 색 번호 1~7 = 이름 문자 코드 해시 % 7 + 1.
 * 같은 이름은 늘 같은 색이고, 첫 글자가 같아도 이름이 다르면 대개 다른 색이 된다.
 */
export function badgeColor(name: string): number {
  let hash = 0;
  for (const ch of name.trim()) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return (hash % BADGE_COLOR_COUNT) + 1;
}
