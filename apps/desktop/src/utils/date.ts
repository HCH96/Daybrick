const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 날짜를 "2026년 10월 21일 (수)" 형식으로 바꾼다. 기준은 PC의 현지 시간. */
export function formatKoreanDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

/** 날짜를 저장용 "YYYY-MM-DD" 문자열로 바꾼다. 기준은 PC의 현지 시간. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface WeekDay {
  date: Date;
  weekday: string; // "월" ~ "일"
  isToday: boolean;
}

/** 주어진 날짜가 속한 주의 월요일~일요일 7일을 돌려준다. 기준은 PC의 현지 시간. */
export function getWeekDays(today: Date): WeekDay[] {
  const daysFromMonday = (today.getDay() + 6) % 7; // 월=0, ..., 일=6
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysFromMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return {
      date,
      weekday: WEEKDAYS[date.getDay()],
      isToday: i === daysFromMonday,
    };
  });
}

/** "YYYY-MM-DD"를 그 날 0시(현지 시간)의 Date로 바꾼다. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** today부터 key 날짜까지 남은 일 수. 오늘이면 0, 지났으면 음수. */
export function daysUntil(key: string, today: Date): number {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // 서머타임 등으로 하루가 24시간이 아닐 수 있어 반올림한다.
  return Math.round((parseDateKey(key).getTime() - from.getTime()) / 86_400_000);
}

/** 날짜가 든 주의 월요일 "YYYY-MM-DD" (getWeekDays와 같은 월요일 기준). 날짜 키나 Date 모두 받는다. */
export function startOfWeek(date: string | Date): string {
  const d = typeof date === "string" ? parseDateKey(date) : date;
  const daysFromMonday = (d.getDay() + 6) % 7; // 월=0, ..., 일=6
  return toDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysFromMonday));
}

/** 날짜에서 n일 뒤(음수면 앞)의 "YYYY-MM-DD" */
export function addDays(date: string | Date, n: number): string {
  const d = typeof date === "string" ? parseDateKey(date) : date;
  return toDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

/** a에서 b까지의 일 수 (b − a). 같은 날이면 0. */
export function diffDays(a: string, b: string): number {
  // 서머타임 등으로 하루가 24시간이 아닐 수 있어 반올림한다.
  return Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / 86_400_000);
}
