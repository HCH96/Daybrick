/**
 * 지난 시각을 "방금 / N분 전 / N시간 전 / 어제 / M월 D일"로 나타낸다 (알림 R12).
 * - 1분 안(또는 시계가 어긋나 미래 시각)이면 "방금"
 * - 1시간 안이면 "N분 전"
 * - 오늘이면 "N시간 전", 어제 날짜면 "어제", 그보다 앞이면 "M월 D일"
 */
export function formatRelativeTime(iso: string, now: Date): string {
  const time = new Date(iso);
  if (Number.isNaN(time.getTime())) return "";
  const diffMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);

  if (diffMinutes < 1) return "방금";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const day = startOfDay(time);
  if (day === startOfDay(now)) return `${Math.floor(diffMinutes / 60)}시간 전`;

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
  if (day === yesterday) return "어제";

  return `${time.getMonth() + 1}월 ${time.getDate()}일`;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
