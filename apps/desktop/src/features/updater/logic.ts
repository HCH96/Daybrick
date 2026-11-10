/** 자동 업데이트의 순수 함수들 (화면·Tauri와 무관) */

/** 마지막 확인 뒤 이만큼 지나면 다시 확인한다 (R2) */
export const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

function parts(v: string): number[] {
  return v
    .trim()
    .replace(/^v/, "")
    .split("-")[0]
    .split(".")
    .map((p) => Number.parseInt(p, 10) || 0);
}

/** `x.y.z` 버전을 숫자로 비교한다. a가 크면 1, 같으면 0, 작으면 -1 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const pa = parts(a);
  const pb = parts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/** 찾은 버전의 알림을 보낼지: 알린 버전이 없거나 찾은 버전이 더 크면 true (R7) */
export function shouldNotify(found: string, lastNotified: string | null | undefined): boolean {
  if (!lastNotified) return true;
  return compareVersions(found, lastNotified) > 0;
}

/** 다시 확인할 때가 됐는지: 확인한 적이 없거나 24시간 이상 지났으면 true (R2, D4) */
export function isCheckDue(lastCheckedAt: number | null, now: number): boolean {
  if (lastCheckedAt === null) return true;
  return now - lastCheckedAt >= CHECK_INTERVAL_MS;
}

/** 받기 진행률(0–100 정수). 전체 크기를 모르면 null */
export function progressPercent(downloaded: number, total: number | null | undefined): number | null {
  if (total === null || total === undefined || total <= 0) return null;
  const pct = Math.floor((downloaded / total) * 100);
  return Math.min(100, Math.max(0, pct));
}
