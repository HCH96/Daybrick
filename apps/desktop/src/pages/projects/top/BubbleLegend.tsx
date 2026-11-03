import { formatBubbleTime, LEGEND, legendRowY, type BubbleItem } from "../../../features/projects/bubbleScale";

interface BubbleLegendProps {
  /** 시간 많은 순 */
  items: BubbleItem[];
  width: number;
  height: number;
  runningId: string | null;
}

/** 이름이 시간 글자와 겹치지 않게 9자까지 */
const NAME_MAX = 9;
function shortName(name: string): string {
  return name.length > NAME_MAX ? `${name.slice(0, NAME_MAX - 1)}…` : name;
}

/**
 * 버블 범례 (프로젝트 R38): 오른쪽 아래에 색 점·이름·시간, 배경·테두리 없음.
 * 줄마다 key를 프로젝트 id로 두고 y 자리를 CSS transform으로 옮겨, 순서가 바뀌면
 * 600ms easeCubicInOut(cubic-bezier)으로 자리를 옮긴다.
 */
function BubbleLegend({ items, width, height, runningId }: BubbleLegendProps) {
  const dotX = width - LEGEND.margin - LEGEND.width;
  const timeX = width - LEGEND.margin;
  return (
    <g className="proj-bubble__legend">
      {items.map((item, i) => (
        <g
          key={item.id}
          className="proj-bubble__row"
          style={{ transform: `translate(0px, ${legendRowY(i, items.length, height)}px)` }}
        >
          <circle cx={dotX} cy={0} r={LEGEND.dotR} fill={item.color} />
          <text
            className={`proj-bubble__name${item.id === runningId ? " proj-bubble__name--on" : ""}`}
            x={dotX + LEGEND.nameGap}
            y={4}
          >
            {shortName(item.name)}
            <title>{item.name}</title>
          </text>
          <text className="proj-bubble__time" x={timeX} y={4}>
            {formatBubbleTime(item.minutes)}
          </text>
        </g>
      ))}
    </g>
  );
}

export default BubbleLegend;
