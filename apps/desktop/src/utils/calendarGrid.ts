import { toDateKey } from "./date";

export interface CalendarCell {
  date: Date;
  key: string; // "YYYY-MM-DD"
  inMonth: boolean; // 보고 있는 달의 날짜인지 (앞뒤 달 날짜는 흐리게)
}

/**
 * 한 달을 일요일(weekStartsOn이 1이면 월요일)부터 시작하는 주 단위로 나눈다. 앞뒤로 모자란 칸은 이전·다음 달 날짜로 채운다.
 * 주 수는 그 달에 필요한 만큼(4~6주). 작은 달력과 큰 달력(8단계)이 같이 쓴다.
 * month는 0부터 (0 = 1월), JS Date와 같다.
 */
export function getMonthGrid(year: number, month: number, weekStartsOn: 0 | 1 = 0): CalendarCell[][] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() - weekStartsOn + 7) % 7; // 1일 앞에 채울 칸 수
  const start = new Date(year, month, 1 - lead); // 그 주의 첫날
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil((lead + daysInMonth) / 7);

  return Array.from({ length: weekCount }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
      return { date, key: toDateKey(date), inMonth: date.getMonth() === month };
    }),
  );
}
