import { isActive, isApplicationDue, getNextItem, sortByNextDate } from "../applications/schedule";
import { EVENT_KIND_LABELS } from "../applications/statuses";
import type { Application, ApplicationsData } from "../applications/types";
import { companyName } from "./applicationEvents";

const UNTITLED = "제목 없음";

/** 지원 카드 고르기 창·연결된 카드 줄에 보여줄 카드 하나 (R39) */
export interface LinkCardItem {
  application: Application;
  title: string; // 카드 제목, 비었으면 "제목 없음"
  company: string; // 회사 이름, 없으면 ""
  /** 고르기 창 둘째 줄: "회사 · 가장 가까운 일정" (둘 중 있는 것만) */
  sub: string;
}

/** 카드 하나를 보여줄 모양으로 바꾼다 */
export function toLinkCardItem(data: ApplicationsData, application: Application, today: Date): LinkCardItem {
  const company = companyName(data, application.values);
  const next = isActive(application) ? nextEventText(application, today) : "";
  return {
    application,
    title: application.title.trim() || UNTITLED,
    company,
    sub: [company, next].filter((s) => s !== "").join(" · "),
  };
}

/** 연결된 카드를 찾는다. 없으면 null */
export function findLinkCard(data: ApplicationsData, applicationId: string, today: Date): LinkCardItem | null {
  const application = data.applications.find((a) => a.id === applicationId);
  return application ? toLinkCardItem(data, application, today) : null;
}

/**
 * 고르기 창 목록 (R39): 찾기 글자가 제목이나 회사에 들어 있는 카드만,
 * 진행 중 카드는 가까운 일정 순으로 먼저, 종료 카드는 아래에 따로.
 */
export function buildCardPickList(
  data: ApplicationsData,
  query: string,
  today: Date,
): { active: LinkCardItem[]; closed: LinkCardItem[] } {
  const q = query.trim().toLowerCase();
  const items = sortByNextDate(data.applications, today)
    .map((a) => toLinkCardItem(data, a, today))
    .filter((item) => q === "" || item.application.title.toLowerCase().includes(q) || item.company.toLowerCase().includes(q));
  return {
    active: items.filter((item) => isActive(item.application)),
    closed: items.filter((item) => !isActive(item.application)),
  };
}

/** 가장 가까운 일정 글자: "코딩테스트 11/3 14:00", "지원 마감 11/2 18:00". 없으면 "" */
function nextEventText(application: Application, today: Date): string {
  const next = getNextItem(application, today);
  if (!next || next.kind === "applied") return "";
  if (next.kind === "event") {
    return eventText(EVENT_KIND_LABELS[next.event.kind], next.event.date, next.event.time);
  }
  const due = application.events.find((e) => isApplicationDue(e) && e.date === next.date);
  return eventText(EVENT_KIND_LABELS["application-due"], next.date, due?.time ?? null);
}

function eventText(label: string, date: string, time: string | null): string {
  const [, month, day] = date.split("-");
  const when = `${Number(month)}/${Number(day)}`;
  return time ? `${label} ${when} ${time}` : `${label} ${when}`;
}
