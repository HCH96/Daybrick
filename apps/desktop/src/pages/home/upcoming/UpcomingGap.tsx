import { gapLabel } from "../../../features/home/upcoming";

interface UpcomingGapProps {
  from: string;
  to: string;
}

/** 이어진 빈 날을 합친 한 줄: 양쪽 점선 사이에 "11/11 – 11/13 · 일정 없음" (R33, D19) */
function UpcomingGap({ from, to }: UpcomingGapProps) {
  return <div className="upcoming-gap">{gapLabel(from, to)} · 일정 없음</div>;
}

export default UpcomingGap;
