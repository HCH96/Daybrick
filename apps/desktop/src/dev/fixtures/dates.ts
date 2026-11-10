/** 예시 데이터용 날짜 계산. 오늘 기준 상대 날짜로 만들어 언제 열어도 화면이 채워지게 한다. */

export function addDays(base: Date, days: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** 현지 날짜 "YYYY-MM-DD" */
export function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 오늘 기준 n일 뒤의 "YYYY-MM-DD" */
export function day(today: Date, n: number): string {
  return ymd(addDays(today, n));
}

/** 오늘 기준 n일 뒤 h시 m분의 ISO 시각 */
export function at(today: Date, n: number, h: number, m = 0): string {
  const d = addDays(today, n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** 이번 주 월요일 기준 n주 뒤 월요일 "YYYY-MM-DD" */
export function monday(today: Date, weeks: number): string {
  const offset = (today.getDay() + 6) % 7; // 월요일 0
  return day(today, weeks * 7 - offset);
}
