/** 프로필 탭 표시 도우미: 날짜·크기 글자, 결과 한 줄 */

/** 판 아래 결과 한 줄: 성공 초록, 실패 빨강. null이면 숨긴다 */
export type StatusLine = { ok: boolean; text: string } | null;

/** 10/27 */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 10/27 14:02 */
export function formatDayTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDay(iso)} ${hh}:${mm}`;
}

/** 312KB, 1.2MB */
export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
