import { useEffect, useMemo, useRef, useState } from "react";
import {
  bubbleItems,
  bubbleRadius,
  bubbleScaleK,
  formatBubbleTime,
  formatBubbleWeek,
  legendBox,
} from "../../../features/projects/bubbleScale";
import { dayBreakdown } from "../../../features/projects/heat";
import { activeProjects } from "../../../features/projects/progress";
import type { ProjectClock } from "../../../features/projects/useProjectClock";
import type { PlanData } from "../../../features/plan/types";
import { startOfWeek } from "../../../utils/date";
import BubbleLegend from "./BubbleLegend";
import { useBubbleSim, type BubbleTarget } from "./useBubbleSim";
import type { TopHighlight } from "./useTopHighlight";
import "./Bubble.css";

interface BubblePanelProps {
  data: PlanData;
  clock: ProjectClock;
  highlight: TopHighlight;
  onHoverProject: (projectId: string | null) => void;
}

interface Size {
  width: number;
  height: number;
}

/** 그리는 칸의 픽셀 크기 (바뀔 때만 새 객체) */
function useBoxSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const width = Math.round(el.clientWidth);
      const height = Math.round(el.clientHeight);
      setSize((prev) =>
        prev && prev.width === width && prev.height === height ? prev : width > 0 && height > 0 ? { width, height } : null,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

/**
 * 목록 윗줄 오른쪽 "이번 주 투입" 버블 판 (프로젝트 R2·R35–R44).
 * 머리: 기간·합계, 실제 타이머가 돌 때만 `● <이름> 진행 중`. 모두 0분이면 빈 상태 안내.
 * 서로 강조(R58–R59): 원·범례에 마우스 → 나머지 흐림·고른 원 흰 테두리, 잔디 칸에 마우스 → 그날 한 원 반짝임.
 */
function BubblePanel({ data, clock, highlight, onHoverProject }: BubblePanelProps) {
  const items = useMemo(() => bubbleItems(activeProjects(data), clock.byProject), [data, clock.byProject]);
  const glowIds = useMemo(() => {
    const ids = new Set<string>();
    if (highlight.dayKey === null) return ids;
    for (const { projectId } of dayBreakdown(clock.days, highlight.dayKey)) ids.add(projectId);
    return ids;
  }, [clock.days, highlight.dayKey]);
  const soloId = highlight.projectId !== null && items.some((x) => x.id === highlight.projectId) ? highlight.projectId : null;
  const total = items.reduce((sum, x) => sum + x.minutes, 0);
  const running = clock.runningProjectId ? data.projects.find((p) => p.id === clock.runningProjectId) : undefined;
  const week = formatBubbleWeek(startOfWeek(clock.todayKey));

  return (
    <section className="proj-panel proj-bubble">
      <div className="proj-panel__head">
        <b>이번 주 투입</b>
        <span>{total > 0 ? `${week} · ${formatBubbleTime(total)}` : week}</span>
        {running && (
          <span className="proj-live proj-panel__right">
            <b>{running.name}</b> 진행 중
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="proj-bubble__empty">
          <span className="proj-bubble__ring" />
          이번 주 기록 없음
          <small>프로젝트 태스크로 타이머를 시작하면 원이 나타나요</small>
        </div>
      ) : (
        <BubbleField
          items={items}
          runningId={clock.runningProjectId}
          soloId={soloId}
          glowIds={glowIds}
          onHover={onHoverProject}
        />
      )}
    </section>
  );
}

interface BubbleFieldProps {
  items: ReturnType<typeof bubbleItems>;
  runningId: string | null;
  /** 마우스가 올라간 원·범례의 프로젝트 (나머지는 흐림) */
  soloId: string | null;
  /** 잔디 칸에 마우스가 있는 날 작업한 프로젝트 (테두리 반짝임) */
  glowIds: ReadonlySet<string>;
  onHover: (projectId: string | null) => void;
}

/**
 * 원이 떠다니는 칸 (범례 → 원 순서로 그려 원이 범례 위를 지나간다, R41).
 * 원 `<g>`의 셋째 요소(테두리 원)는 반지름을 useBubbleSim이 원 반지름 + 5로 맞춘다.
 * 흐림은 `<g>` 안 요소에 걸어 useBubbleSim이 쓰는 `<g>` 투명도와 겹치지 않게 한다.
 */
function BubbleField({ items, runningId, soloId, glowIds, onHover }: BubbleFieldProps) {
  const { ref, size } = useBoxSize();
  const k = size ? bubbleScaleK(items.map((x) => x.minutes), size.width, size.height) : 0;
  const targets = useMemo<BubbleTarget[]>(
    () => items.map((x) => ({ id: x.id, minutes: x.minutes, r: bubbleRadius(x.minutes, k) })),
    [items, k],
  );
  const legend = size ? legendBox(items.length, size.width, size.height) : null;
  const sim = useBubbleSim(targets, size, legend);

  return (
    <div className="proj-bubble__field" ref={ref}>
      {size && (
        <svg className="proj-bubble__svg" width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
          <BubbleLegend
            items={items}
            width={size.width}
            height={size.height}
            runningId={runningId}
            soloId={soloId}
            onHover={onHover}
          />
          {items.map((item) => {
            const cls = ["proj-bubble__node"];
            if (soloId !== null && soloId !== item.id) cls.push("is-dim");
            const halo = ["proj-bubble__halo"];
            if (soloId === item.id) halo.push("is-ring");
            else if (glowIds.has(item.id)) halo.push("is-glow");
            return (
              <g
                key={item.id}
                ref={sim.nodeRef(item.id)}
                className={cls.join(" ")}
                onPointerDown={sim.startDrag(item.id)}
                onPointerEnter={() => onHover(item.id)}
                onPointerLeave={() => onHover(null)}
              >
                <circle fill={item.color} />
                <text className="proj-bubble__pct">{item.percent}%</text>
                <circle className={halo.join(" ")} stroke={item.color} />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export default BubblePanel;
