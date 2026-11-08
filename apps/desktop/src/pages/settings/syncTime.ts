/** 동기화 칸·선택창의 시각 글자 "11/8 19:08" (PC 현지 시각). 읽지 못하면 null */
export function formatSyncTime(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}
