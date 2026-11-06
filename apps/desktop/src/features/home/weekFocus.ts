/**
 * 홈 "이번 주 집중" 계산 (R38–R39). 화면 없는 순수 함수.
 * 주는 플랜과 같은 `startOfWeek`(월요일)부터 7일, 하루 합계는 투데이 `dayTotals`(실행 중 타이머 포함, 자정에서 자름)를 그대로 쓴다 (D11).
 */
import { dayTotals } from "../today/stats";
import type { TodayData } from "../today/types";
import { addDays, startOfWeek } from "../../utils/date";
import { shortDateLabel } from "./upcoming";

const WEEKDAY_LETTERS = ["월", "화", "수", "목", "금", "토", "일"] as const;

/** 지난 요일 / 오늘 / 아직 안 온 요일 */
export type WeekDayState = "past" | "today" | "future";

export interface WeekFocusDay {
  dateKey: string; // "YYYY-MM-DD"
  weekday: string; // 막대 아래 글자 "월" ~ "일"
  label: string; // 말풍선 날짜 "11/5 (목)"
  ms: number; // 그날 집중 시간 (안 온 요일은 0)
  state: WeekDayState;
}

/** 이번 주 월~일 7일의 집중 시간 (R38) */
export function weekFocus(today: TodayData, todayKey: string, now: number): WeekFocusDay[] {
  const totals = dayTotals(today, now);
  const start = startOfWeek(todayKey);
  return WEEKDAY_LETTERS.map((weekday, i) => {
    const dateKey = addDays(start, i);
    const state: WeekDayState = dateKey < todayKey ? "past" : dateKey === todayKey ? "today" : "future";
    return {
      dateKey,
      weekday,
      label: shortDateLabel(dateKey),
      ms: state === "future" ? 0 : (totals.get(dateKey) ?? 0),
      state,
    };
  });
}

/** 이번 주 합계(밀리초) (R39) */
export function weekTotal(days: WeekFocusDay[]): number {
  return days.reduce((sum, day) => sum + day.ms, 0);
}
