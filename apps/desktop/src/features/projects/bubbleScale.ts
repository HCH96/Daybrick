/**
 * 주간 투입 버블 계산 (순수 함수, 프로젝트 R35–R38·R42).
 * 반지름 = √분 × k (400분 = 50 기준, 원 넓이 합이 판의 32%를 넘으면 모두 같은 비율로 줄임),
 * 원 안 글자 크기, 퍼센트, 범례 순서·자리, 시간 글자를 정한다.
 */
import { addDays, parseDateKey } from "../../utils/date";
import type { Project } from "../plan/types";
import type { ProjectTime } from "./useProjectClock";

const MINUTE = 60_000;
/** 400분 = 반지름 50 */
const BASE_K = 50 / Math.sqrt(400);
/** 원 넓이 합의 한도 (판 넓이 대비) */
const MAX_AREA_RATIO = 0.32;

/** 버블 하나 (이번 주 1분 이상인 진행 중 프로젝트) */
export interface BubbleItem {
  id: string;
  name: string;
  color: string;
  minutes: number;
  /** 이번 주 전체 대비 정수 퍼센트 */
  percent: number;
}

/** 진행 중 프로젝트 중 이번 주 1분 이상만, 시간 많은 순 (범례 순서, R38·R42) */
export function bubbleItems(projects: Project[], byProject: Map<string, ProjectTime>): BubbleItem[] {
  const list = projects
    .map((p) => ({ project: p, minutes: Math.floor((byProject.get(p.id)?.week ?? 0) / MINUTE) }))
    .filter((x) => x.minutes >= 1);
  const total = list.reduce((sum, x) => sum + x.minutes, 0);
  return list
    .map(({ project, minutes }) => ({
      id: project.id,
      name: project.name,
      color: project.color,
      minutes,
      percent: total > 0 ? Math.round((minutes / total) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

/** 반지름 비율 k (R36). 판 크기가 0이면 기준값 */
export function bubbleScaleK(minutesList: number[], width: number, height: number): number {
  const sum = minutesList.reduce((s, m) => s + m, 0);
  if (sum <= 0 || width <= 0 || height <= 0) return BASE_K;
  const limit = MAX_AREA_RATIO * width * height;
  const area = Math.PI * BASE_K * BASE_K * sum;
  return area > limit ? Math.sqrt(limit / (Math.PI * sum)) : BASE_K;
}

export function bubbleRadius(minutes: number, k: number): number {
  return Math.sqrt(Math.max(0, minutes)) * k;
}

/** 원 안 퍼센트 글자 크기 = 반지름/2.6, 12~30 (R37) */
export function bubbleFontSize(r: number): number {
  return Math.min(30, Math.max(12, r / 2.6));
}

/** 시간 글자 "N시간 M분" / "N시간" / "M분" */
export function formatBubbleTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/** 이번 주 기간 "11/2–11/8" (weekStart = 월요일 키) */
export function formatBubbleWeek(weekStart: string): string {
  const md = (key: string) => {
    const d = parseDateKey(key);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  return `${md(weekStart)}–${md(addDays(weekStart, 6))}`;
}

/** 범례 자리 값 (visual.md: 오른쪽 아래 여백 6, 줄 간격 20, 점 반지름 4) */
export const LEGEND = {
  margin: 6,
  rowGap: 20,
  dotR: 4,
  /** 점 중심에서 시간 글자 오른쪽 끝까지 (목업 274 → 434) */
  width: 160,
  /** 점 중심에서 이름 글자 시작까지 */
  nameGap: 10,
} as const;

/** 범례가 차지하는 칸 (원이 지나갈 때 반투명 판정용, R41) */
export interface LegendBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** i번째 줄 점 중심 y (마지막 줄이 맨 아래) */
export function legendRowY(index: number, count: number, height: number): number {
  return height - LEGEND.margin - 2 - (count - 1 - index) * LEGEND.rowGap;
}

export function legendBox(count: number, width: number, height: number): LegendBox | null {
  if (count === 0) return null;
  const top = legendRowY(0, count, height) - LEGEND.rowGap / 2;
  const left = width - LEGEND.margin - LEGEND.width - LEGEND.dotR;
  return { x: left, y: top, w: width - left, h: height - top };
}
