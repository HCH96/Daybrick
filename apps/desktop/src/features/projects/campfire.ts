/** 모닥불 단계와 마지막 작업일 글자 (순수 함수, 프로젝트 R26·R57, visual.md 모닥불 단계) */
import { diffDays } from "../../utils/date";

/** 불 단계: 활활 / 보통 / 작은 불 / 잉걸불 / 꺼짐(연기) / 장작만 */
export type Fire = "blaze" | "mid" | "small" | "ember" | "out" | "wood";

/** 마지막 작업일로 정하는 불 (카드·진행 판): 오늘 활활, 1일 전 보통, 2–3일 작은 불, 4–6일 잉걸불, 7일 이상 꺼짐, 기록 없음 장작 */
export function fireByLastDay(lastDay: string | null, todayKey: string): Fire {
  if (lastDay === null) return "wood";
  const days = diffDays(lastDay, todayKey);
  if (days <= 0) return "blaze";
  if (days === 1) return "mid";
  if (days <= 3) return "small";
  if (days <= 6) return "ember";
  return "out";
}

/** 연속 작업일로 정하는 불 (잔디 옆, 프로젝트 R57): 0일 장작, 1–2일 작은 불, 3–6일 보통, 7일 이상 활활 */
export function fireByStreak(days: number): Fire {
  if (days <= 0) return "wood";
  if (days <= 2) return "small";
  if (days <= 6) return "mid";
  return "blaze";
}

/** 마지막 작업일 글자 (프로젝트 R26): "오늘" / "어제" / "N일 전" / "아직 없음" */
export function formatLastWork(lastDay: string | null, todayKey: string): string {
  if (lastDay === null) return "아직 없음";
  const days = diffDays(lastDay, todayKey);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
}
