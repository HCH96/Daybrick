import type { AiCall, BalanceRecord, JsSettings } from "./types";

/**
 * 사용액 줄 계산 (R75, R76). 날짜 경계(오늘·이번 달)는 서버 함수 `_shared/ai.ts`와 같이 한국 시간이다 (D25).
 * 값은 이 앱이 기록한 호출만 더한 것이다 (R77).
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간 오늘 0시·이번 달 1일 0시 */
export function kstBoundaries(now: Date): { dayStart: Date; monthStart: Date } {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth();
  return {
    dayStart: new Date(Date.UTC(y, m, kst.getUTCDate()) - KST_OFFSET_MS),
    monthStart: new Date(Date.UTC(y, m, 1) - KST_OFFSET_MS),
  };
}

/** 호출 기록을 어디부터 읽어야 하는지: 이번 달 1일과 보여 줄 가장 오래된 기준 잔액 중 이른 쪽 */
export function callsSince(records: readonly BalanceRecord[], now: Date): string {
  const { monthStart } = kstBoundaries(now);
  const oldest = records.length > 0 ? new Date(records[records.length - 1].setAt) : monthStart;
  return (oldest < monthStart ? oldest : monthStart).toISOString();
}

function sumCost(calls: readonly AiCall[], from: Date, until?: Date): number {
  let sum = 0;
  for (const call of calls) {
    const at = new Date(call.at);
    if (at >= from && (!until || at < until)) sum += call.costUsd;
  }
  return sum;
}

export interface UsageSummary {
  todayCalls: number;
  dailyLimit: number;
  monthCostUsd: number;
  monthlyLimitUsd: number;
  /** 마지막 기준 잔액. 넣은 적이 없으면 null */
  baselineUsd: number | null;
  /** 기준 이후 사용액 */
  sinceBaselineUsd: number;
  /** 예상 잔액 = 기준 − 기준 이후. 기준이 없으면 null */
  estimatedUsd: number | null;
}

/** records는 최근 것부터 (loadBalanceRecords 순서) */
export function summarizeUsage(
  settings: JsSettings,
  records: readonly BalanceRecord[],
  calls: readonly AiCall[],
  now: Date,
): UsageSummary {
  const { dayStart, monthStart } = kstBoundaries(now);
  const todayCalls = calls.filter((call) => new Date(call.at) >= dayStart).length;
  const baseline = records[0] ?? null;
  const sinceBaselineUsd = baseline ? sumCost(calls, new Date(baseline.setAt)) : 0;
  return {
    todayCalls,
    dailyLimit: settings.dailyLimit,
    monthCostUsd: sumCost(calls, monthStart),
    monthlyLimitUsd: settings.monthlyLimitUsd,
    baselineUsd: baseline ? baseline.amountUsd : null,
    sinceBaselineUsd,
    estimatedUsd: baseline ? baseline.amountUsd - sinceBaselineUsd : null,
  };
}

export interface BalanceHistoryRow {
  id: string;
  setAt: string;
  amountUsd: number;
  /** 다음 기준을 넣을 때까지의 기준 이후 사용액. 지금 기준이면 null */
  spentUsd: number | null;
}

/** 입력 기록 표의 줄: 각 기준부터 다음 기준 전까지 쓴 금액 */
export function balanceHistory(records: readonly BalanceRecord[], calls: readonly AiCall[]): BalanceHistoryRow[] {
  return records.map((record, index) => {
    const next = index > 0 ? records[index - 1] : null;
    return {
      id: record.id,
      setAt: record.setAt,
      amountUsd: record.amountUsd,
      spentUsd: next ? sumCost(calls, new Date(record.setAt), new Date(next.setAt)) : null,
    };
  });
}

/** 한도의 몇 %인지 (0–100). 80% 이상이면 주황 막대 */
export function percentOf(value: number, limit: number): number {
  if (limit <= 0) return 100;
  return Math.min(100, Math.max(0, (value / limit) * 100));
}

export const WARN_PERCENT = 80;

/** $4.10 모양 */
export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 10/01 (목) 모양 (이 PC 시간) */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd} (${WEEKDAYS[d.getDay()]})`;
}
