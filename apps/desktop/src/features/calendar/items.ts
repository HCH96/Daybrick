/**
 * 캘린더에 그릴 항목 모으기 (R8–R17). 플랜·지원관리·캘린더 저장소를 읽기만 하고 화면용 `CalItem`으로 바꾼다.
 * 저장소가 바뀌면 다시 계산하므로 다른 화면에서 고친 내용이 바로 보인다 (R8).
 */
import { groupEntriesByDate } from "../applications/calendarEntries";
import type { ApplicationsData, EventKind } from "../applications/types";
import { companyName } from "../plan/applicationEvents";
import type { PlanData } from "../plan/types";
import { taskGroupInfo } from "../projects/group";
import { badgeColor, badgeInitial } from "./badge";
import { buildCheckpoints } from "./checkpoints";
import type { PersonalEvent } from "./types";

export type CalItem =
  | {
      kind: "task";
      key: string;
      taskId: string;
      title: string;
      start: string;
      end: string;
      color: string; // 카테고리 색, 프로젝트 태스크는 프로젝트 색
      done: boolean;
      createdAt: string; // 막대 줄 순서 (만든 순)
    }
  | {
      kind: "app";
      key: string;
      applicationId: string;
      eventKind: EventKind;
      text: string; // 회사 → 카드 제목 → "제목 없음"
      initial: string; // 배지 글자
      badge: number; // 배지 색 1~7
      date: string;
      time: string | null;
    }
  | { kind: "flag"; key: string; projectId: string; label: string; color: string; date: string; done: boolean }
  | {
      kind: "personal";
      key: string;
      eventId: string;
      title: string;
      start: string;
      end: string;
      time: string | null;
      createdAt: string;
    };

const UNTITLED = "제목 없음";

/** 항목의 첫날·끝날 (하루짜리는 같다) */
export function itemRange(item: CalItem): { start: string; end: string } {
  if (item.kind === "task" || item.kind === "personal") return { start: item.start, end: item.end };
  return { start: item.date, end: item.date };
}

export interface CalSources {
  plan: PlanData | null; // 아직 못 읽었으면 null (그 항목만 빠진다)
  applications: ApplicationsData | null;
  events: PersonalEvent[];
}

/** 보이는 기간(from~to, 둘 다 포함)에 걸린 항목 전부. 순서: 태스크 → 지원 → 깃발 → 개인 */
export function buildCalItems(src: CalSources, from: string, to: string): CalItem[] {
  const items: CalItem[] = [];

  if (src.plan) {
    const plan = src.plan;
    for (const task of plan.tasks) {
      if (task.start === null || task.end === null) continue;
      items.push({
        kind: "task",
        key: `task:${task.id}`,
        taskId: task.id,
        title: task.title.trim() || UNTITLED,
        start: task.start,
        end: task.end,
        color: taskGroupInfo(plan, task).color,
        done: task.status === "done",
        createdAt: task.createdAt,
      });
    }
  }

  if (src.applications) {
    const data = src.applications;
    const byId = new Map(data.applications.map((a) => [a.id, a]));
    // 지원 마감은 "지원 준비" 카드만 (지원관리 R39와 같은 규칙, groupEntriesByDate가 거른다)
    for (const list of groupEntriesByDate(data.applications).values()) {
      for (const entry of list) {
        const app = byId.get(entry.applicationId);
        const company = app ? companyName(data, app.values) : "";
        const text = company || entry.title.trim() || UNTITLED;
        items.push({
          kind: "app",
          key: `app:${entry.applicationId}:${entry.key}`,
          applicationId: entry.applicationId,
          eventKind: entry.kind,
          text,
          initial: badgeInitial(text),
          badge: badgeColor(text),
          date: entry.date,
          time: entry.time,
        });
      }
    }
  }

  if (src.plan) {
    for (const cp of buildCheckpoints(src.plan)) {
      items.push({
        kind: "flag",
        key: `flag:${cp.stageId}`,
        projectId: cp.projectId,
        label: cp.label,
        color: cp.color,
        date: cp.date,
        done: cp.done,
      });
    }
  }

  for (const ev of src.events) {
    items.push({
      kind: "personal",
      key: `personal:${ev.id}`,
      eventId: ev.id,
      title: ev.title.trim() || UNTITLED,
      start: ev.start,
      end: ev.end,
      time: ev.start === ev.end ? ev.time : null,
      createdAt: ev.createdAt,
    });
  }

  // 날짜 문자열은 사전 순 = 날짜 순
  return items.filter((item) => {
    const r = itemRange(item);
    return r.start <= to && r.end >= from;
  });
}
