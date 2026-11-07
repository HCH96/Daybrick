/**
 * 벽돌 벽 계산 (화면 없는 순수 함수). 단위는 시간(벽돌 한 장 = 1시간).
 */

/**
 * 하루 집중 시간을 벽돌 길이 목록으로 나눈다. 합은 언제나 hours와 같다.
 * offset이면 맨 앞을 반 장으로 시작해 윗줄과 이음매를 반 칸 엇갈린다.
 * 1시간이 안 되는 나머지는 그 길이만큼 짧은 벽돌 한 장.
 */
export function brickSegments(hours: number, offset: boolean): number[] {
  if (!(hours > 0)) return [];
  const out: number[] = [];
  let left = hours;
  if (offset) {
    const first = Math.min(0.5, left);
    out.push(first);
    left -= first;
  }
  while (left >= 1) {
    out.push(1);
    left -= 1;
  }
  if (left > 1e-6) out.push(left);
  return out;
}

/** 벽 너비를 몇 시간으로 잡을지: 목표와 가장 긴 날 중 큰 쪽을 올림 (최소 1) */
export function wallColumns(goalHours: number, dayHours: number[]): number {
  return Math.max(1, Math.ceil(goalHours), ...dayHours.map((h) => Math.ceil(h)));
}
