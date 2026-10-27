import { EVENT_KIND_LABELS, findStatus, STAGES } from "../../../features/applications/statuses";
import type { StageId, StatusId } from "../../../features/applications/types";
import type { MailCategory, MailSchedule, MailSuggestion } from "../../../features/job-search/mailApi";

/** 메일 제안 탭 글자 만들기 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** ISO 시각 → `10/26 (월) 18:12` */
export function dateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO 시각 → `10/22` */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export const CATEGORY_LABELS: Record<MailCategory, string> = {
  "next-stage": "서류 합격·다음 전형 안내",
  attended: "전형 응시 확인",
  rejected: "불합격",
  offer: "최종 합격",
};

/** 상태 + 세부 단계: `전형 준비 · 코딩테스트` */
export function statusText(status: StatusId | null, stage: StageId | null): string {
  if (!status) return "알 수 없음";
  const label = findStatus(status).label;
  const stageLabel = stage ? STAGES.find((s) => s.id === stage)?.label : undefined;
  return stageLabel ? `${label} · ${stageLabel}` : label;
}

/** 승인하면 바뀔 결과 (종료일 때만) */
export function resultText(category: MailCategory): string | null {
  if (category === "rejected") return "불합격";
  if (category === "offer") return "최종 합격";
  return null;
}

/** `11/15 (일) 14:00 코딩테스트` (날짜만 있는 일정은 시각 없이) */
export function scheduleText(schedule: MailSchedule): string {
  const [y, m, d] = schedule.date.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  const time = schedule.time ? ` ${schedule.time}` : "";
  return `${m}/${d} (${WEEKDAYS[day.getDay()]})${time} ${schedule.label || EVENT_KIND_LABELS[schedule.kind]}`;
}

/** 지원 건 이름: `넥슨 · [메이플스토리] 게임 서버 프로그래머` */
export function applicationName(s: MailSuggestion): string {
  const company = s.company || "지원 건 없음";
  return s.postingTitle ? `${company} · ${s.postingTitle}` : company;
}
