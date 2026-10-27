/** 마감 표시 (목업 mockup.md "마감 표시"): D-n, 마감일이 없으면 "상시", D-5 이하는 빨간 칩 */

/** D-5 이하면 빨간 칩 */
export const SOON_DAYS = 5;

/** `YYYY-MM-DD`를 그 날 0시(로컬)로. 형식이 틀리면 null */
function parseDay(date: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 오늘부터 마감일까지 남은 날 수 (오늘 마감 0, 지났으면 음수). 마감일이 없거나 읽지 못하면 null (상시) */
export function daysLeft(date: string | null, now: Date): number | null {
  if (!date) return null;
  const day = parseDay(date);
  if (!day) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((day.getTime() - today.getTime()) / 86_400_000);
}

export interface DdayLabel {
  text: string;
  kind: "soon" | "normal" | "always";
}

export function ddayLabel(days: number | null): DdayLabel {
  if (days === null) return { text: "상시", kind: "always" };
  return { text: days === 0 ? "D-day" : `D-${days}`, kind: days <= SOON_DAYS ? "soon" : "normal" };
}
