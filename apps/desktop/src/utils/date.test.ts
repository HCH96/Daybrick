import { describe, expect, it } from "vitest";
import {
  addDays,
  daysUntil,
  diffDays,
  formatKoreanDate,
  getWeekDays,
  isoWeekNumber,
  parseDateKey,
  startOfWeek,
  toDateKey,
} from "./date";

describe("날짜 키", () => {
  it("한 자리 월·일도 두 자리로 적는다", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("키를 읽으면 그날 0시(현지)가 된다", () => {
    const d = parseDateKey("2026-11-11");
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 11, 0]);
  });

  it("한국어 날짜에 요일이 붙는다", () => {
    expect(formatKoreanDate(new Date(2026, 9, 21))).toBe("2026년 10월 21일 (수)");
  });
});

describe("날짜 더하기·차이", () => {
  it("달과 해를 넘긴다", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("윤년의 2월 29일을 지난다", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(diffDays("2028-02-01", "2028-03-01")).toBe(29);
  });

  it("차이는 b − a이고 같은 날이면 0이다", () => {
    expect(diffDays("2026-11-01", "2026-11-11")).toBe(10);
    expect(diffDays("2026-11-11", "2026-11-01")).toBe(-10);
    expect(diffDays("2026-11-11", "2026-11-11")).toBe(0);
  });

  it("남은 일 수는 오늘의 시각과 상관없다", () => {
    const lateToday = new Date(2026, 10, 11, 23, 59);
    expect(daysUntil("2026-11-11", lateToday)).toBe(0);
    expect(daysUntil("2026-11-12", lateToday)).toBe(1);
    expect(daysUntil("2026-11-10", lateToday)).toBe(-1);
  });
});

describe("주", () => {
  it("월요일 시작이고 일요일은 그 주의 끝이다", () => {
    expect(startOfWeek("2026-11-11")).toBe("2026-11-09"); // 수 → 월
    expect(startOfWeek("2026-11-15")).toBe("2026-11-09"); // 일 → 같은 주 월
    expect(startOfWeek("2026-11-09")).toBe("2026-11-09");
  });

  it("주의 7일과 오늘 표시", () => {
    const days = getWeekDays(new Date(2026, 10, 11));
    expect(days.map((d) => d.weekday)).toEqual(["월", "화", "수", "목", "금", "토", "일"]);
    expect(days.findIndex((d) => d.isToday)).toBe(2);
    expect(toDateKey(days[0].date)).toBe("2026-11-09");
  });

  it("ISO 주 번호 (주석의 예시)", () => {
    expect(isoWeekNumber("2026-11-02")).toBe(45);
    expect(isoWeekNumber("2026-01-01")).toBe(1);
    expect(isoWeekNumber("2026-12-28")).toBe(53);
  });
});
