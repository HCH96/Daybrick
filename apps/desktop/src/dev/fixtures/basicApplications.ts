/** 예시 데이터 basic: 지원 관리 카드와 개인 일정 */
import { createEmptyData } from "../../features/applications/storage";
import type { Application, ApplicationsData } from "../../features/applications/types";
import { createEmptyCalendarData } from "../../features/calendar/storage";
import type { CalendarData } from "../../features/calendar/types";
import { at, day } from "./dates";

export const INTERVIEW_APP_ID = "fx-app-interview";

const COMPANIES: [string, "blue" | "amber" | "teal" | "violet"][] = [
  ["네이버", "blue"], ["카카오", "amber"], ["토스", "teal"], ["넥슨", "violet"],
];

export function buildApplications(today: Date): ApplicationsData {
  const base = createEmptyData();
  const properties = base.properties.map((p) =>
    p.role === "company" ? { ...p, options: COMPANIES.map(([name, color], i) => ({ id: `fx-company-${i}`, name, color })) } : p,
  );
  const created = at(today, -20, 10);
  const card = (id: string, title: string, over: Partial<Application>): Application => ({
    id, title, status: "preparing", stage: null, values: {}, events: [], body: "",
    createdAt: created, updatedAt: created, ...over,
  });
  return {
    ...base,
    properties,
    applications: [
      card("fx-app-preparing", "네이버 프론트엔드 신입", {
        values: { company: "fx-company-0", priority: "priority-0" },
        events: [{ id: "fx-ev-1", kind: "application-due", date: day(today, 3), time: "23:59", memo: "" }],
        body: "## 준비할 것\n- 자기소개서 2번 문항\n- 포트폴리오 링크",
      }),
      card(INTERVIEW_APP_ID, "카카오 웹 개발", {
        status: "stage-prep", stage: "interview", values: { company: "fx-company-1", priority: "priority-1" },
        events: [{ id: "fx-ev-2", kind: "interview", date: day(today, 2), time: "14:00", memo: "1차 기술 면접" }],
      }),
      card("fx-app-applied", "토스 프론트엔드", {
        status: "applied", values: { company: "fx-company-2" },
        events: [{ id: "fx-ev-3", kind: "coding-test", date: day(today, 6), time: "10:00", memo: "" }],
      }),
      card("fx-app-closed", "넥슨 웹 클라이언트", {
        status: "closed", values: { company: "fx-company-3", result: "result-1" },
      }),
    ],
  };
}

export function buildCalendar(today: Date): CalendarData {
  const base = createEmptyCalendarData();
  const created = at(today, -7, 9);
  const ev = (id: string, title: string, start: string, end: string, time: string | null) =>
    ({ id, title, start, end, time, createdAt: created, updatedAt: created });
  return {
    ...base,
    events: [
      ev("fx-cal-1", "스터디 모임", day(today, 0), day(today, 0), "19:00"),
      ev("fx-cal-2", "가족 여행", day(today, 8), day(today, 10), null),
      ev("fx-cal-3", "치과", day(today, -4), day(today, -4), "15:30"),
    ],
  };
}
