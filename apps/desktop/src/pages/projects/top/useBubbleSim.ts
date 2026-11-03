/**
 * 버블 떠다니기 시뮬레이션 (프로젝트 R39–R41·R43, D8·D9).
 * d3 forceSimulation 하나를 useRef에 붙잡아 두고, 화면이 사라지면 stop()한다.
 * 매 틱 위치·반지름·투명도는 React를 거치지 않고 원 <g>에 바로 쓴다 (원 안 글자 내용만 React가 그린다).
 */
import { easeBackOut } from "d3-ease";
import {
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  type ForceCollide,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { bubbleFontSize, type LegendBox } from "../../../features/projects/bubbleScale";

/** 시뮬레이션에 넘기는 원 하나 */
export interface BubbleTarget {
  id: string;
  minutes: number;
  r: number;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  minutes: number;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 떠다니는 방향 (라디안) */
  angle: number;
  opacity: number;
  grow: { from: number; to: number; start: number } | null;
}

const WANDER_TURN = 0.125;
const WANDER_FORCE = 0.06;
const MAX_SPEED = 0.9;
const GROW_MS = 700;
const growEase = easeBackOut.overshoot(2);
const LEGEND_OPACITY = 0.35;
const OPACITY_STEP = 0.12;
/** 던질 때 속도 한도 (픽셀/틱) */
const THROW_MAX = 14;
/** 테두리 원은 원보다 5px 크게 (목업 heat-by-bubble·heat-by-cell) */
const HALO_GAP = 5;

interface Size {
  width: number;
  height: number;
}

function overlapsBox(n: SimNode, box: LegendBox): boolean {
  const cx = Math.max(box.x, Math.min(n.x, box.x + box.w));
  const cy = Math.max(box.y, Math.min(n.y, box.y + box.h));
  const dx = n.x - cx;
  const dy = n.y - cy;
  return dx * dx + dy * dy < n.r * n.r;
}

export function useBubbleSim(targets: BubbleTarget[], size: Size | null, legend: LegendBox | null) {
  const simRef = useRef<Simulation<SimNode, undefined> | null>(null);
  const elements = useRef(new Map<string, SVGGElement>());
  const sizeRef = useRef<Size | null>(size);
  const legendRef = useRef<LegendBox | null>(legend);
  const drag = useRef<{ id: string; lastX: number; lastY: number; dx: number; dy: number } | null>(null);
  sizeRef.current = size;
  legendRef.current = legend;

  // 시뮬레이션 만들기 / 화면이 사라지면 멈추기
  useEffect(() => {
    const collide = forceCollide<SimNode>((d) => d.r + 4).strength(0.7).iterations(2);
    const wander = (alpha: number) => {
      void alpha;
      for (const n of sim.nodes()) {
        if (n.fx != null) continue;
        const speed = Math.hypot(n.vx, n.vy);
        // 던진 직후처럼 빠를 때는 감속에 맡기고, 느려지면 다시 떠다닌다
        if (speed > MAX_SPEED) continue;
        n.angle += (Math.random() * 2 - 1) * WANDER_TURN;
        n.vx += Math.cos(n.angle) * WANDER_FORCE;
        n.vy += Math.sin(n.angle) * WANDER_FORCE;
        const next = Math.hypot(n.vx, n.vy);
        if (next > MAX_SPEED) {
          n.vx = (n.vx / next) * MAX_SPEED;
          n.vy = (n.vy / next) * MAX_SPEED;
        }
      }
    };
    const sim = forceSimulation<SimNode>([])
      .alphaDecay(0)
      .velocityDecay(0.08)
      .force("collide", collide)
      .force("x", forceX<SimNode>(0).strength(0.003))
      .force("y", forceY<SimNode>(0).strength(0.003))
      .force("wander", wander);

    sim.on("tick", () => {
      const s = sizeRef.current;
      const box = legendRef.current;
      const now = performance.now();
      let radiusChanged = false;
      for (const n of sim.nodes()) {
        if (n.grow) {
          const t = Math.min(1, (now - n.grow.start) / GROW_MS);
          n.r = n.grow.from + (n.grow.to - n.grow.from) * growEase(t);
          if (t >= 1) {
            n.r = n.grow.to;
            n.grow = null;
          }
          radiusChanged = true;
        }
        // 벽 튕김
        if (s && n.fx == null) {
          const r = Math.min(n.r, s.width / 2, s.height / 2);
          if (n.x < r) { n.x = r; n.vx = Math.abs(n.vx); }
          if (n.x > s.width - r) { n.x = s.width - r; n.vx = -Math.abs(n.vx); }
          if (n.y < r) { n.y = r; n.vy = Math.abs(n.vy); }
          if (n.y > s.height - r) { n.y = s.height - r; n.vy = -Math.abs(n.vy); }
        }
        // 범례 위를 지나면 반투명 (R41)
        const target = box && overlapsBox(n, box) ? LEGEND_OPACITY : 1;
        if (n.opacity < target) n.opacity = Math.min(target, n.opacity + OPACITY_STEP);
        else if (n.opacity > target) n.opacity = Math.max(target, n.opacity - OPACITY_STEP);
        draw(n);
      }
      // 충돌 반지름도 커지는 반지름을 따라간다 (R43)
      if (radiusChanged) collide.radius((d) => d.r + 4);
    });

    const draw = (n: SimNode) => {
      const g = elements.current.get(n.id);
      if (!g) return;
      g.setAttribute("transform", `translate(${n.x.toFixed(2)},${n.y.toFixed(2)})`);
      g.style.opacity = String(n.opacity);
      const circle = g.children[0];
      const text = g.children[1];
      if (circle) circle.setAttribute("r", String(Math.max(0, n.r)));
      if (text) text.setAttribute("font-size", bubbleFontSize(Math.max(0, n.r)).toFixed(1));
      // 셋째 요소: 고른 원 흰 테두리·반짝임 테두리 (프로젝트 R58–R59)
      const halo = g.children[2];
      if (halo) halo.setAttribute("r", String(Math.max(0, n.r) + HALO_GAP));
    };

    simRef.current = sim;
    return () => {
      sim.stop();
      sim.on("tick", null);
      simRef.current = null;
    };
  }, []);

  // 판 크기가 바뀌면 끌림 자리를 옮긴다 (x 45%·y 50%)
  useEffect(() => {
    const sim = simRef.current;
    if (!sim || !size) return;
    sim.force("x", forceX<SimNode>(size.width * 0.45).strength(0.003));
    sim.force("y", forceY<SimNode>(size.height * 0.5).strength(0.003));
  }, [size]);

  // 원 목록 맞추기: 새 원은 0에서 커지고, 분 값이 바뀐 원만 통통 튀며 커진다 (R42·R43, D9)
  useEffect(() => {
    const sim = simRef.current;
    if (!sim || !size) return;
    const now = performance.now();
    const old = new Map(sim.nodes().map((n) => [n.id, n]));
    const next: SimNode[] = targets.map((t) => {
      const n = old.get(t.id);
      if (!n) {
        const r = Math.min(t.r, size.width / 2, size.height / 2);
        return {
          id: t.id,
          minutes: t.minutes,
          r: 0,
          x: r + Math.random() * Math.max(0, size.width - 2 * r),
          y: r + Math.random() * Math.max(0, size.height - 2 * r),
          vx: 0,
          vy: 0,
          angle: Math.random() * Math.PI * 2,
          opacity: 1,
          grow: { from: 0, to: t.r, start: now },
        };
      }
      if (t.minutes !== n.minutes) {
        n.grow = { from: n.r, to: t.r, start: now };
      } else if (n.grow) {
        n.grow.to = t.r;
      } else {
        n.r = t.r;
      }
      n.minutes = t.minutes;
      return n;
    });
    sim.nodes(next);
    sim.force<ForceCollide<SimNode>>("collide")?.radius((d) => d.r + 4);
    sim.alpha(1).restart();
  }, [targets, size]);

  /** 원 <g>를 붙잡는 ref (첫 자식 circle, 둘째 자식 text) */
  const nodeRef = useCallback(
    (id: string) => (el: SVGGElement | null) => {
      if (el) elements.current.set(id, el);
      else elements.current.delete(id);
    },
    [],
  );

  /** 끌기 (R40): 끄는 동안 위치 고정, 놓으면 마지막 움직임 방향으로 날아간다 */
  const startDrag = useCallback(
    (id: string) => (e: ReactPointerEvent<SVGGElement>) => {
      const sim = simRef.current;
      const svg = e.currentTarget.ownerSVGElement;
      const node = sim?.nodes().find((n) => n.id === id);
      if (!sim || !svg || !node || e.button !== 0) return;
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const point = (ev: PointerEvent) => ({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
      const start = point(e.nativeEvent);
      const offX = node.x - start.x;
      const offY = node.y - start.y;
      node.fx = node.x;
      node.fy = node.y;
      drag.current = { id, lastX: node.x, lastY: node.y, dx: 0, dy: 0 };

      const move = (ev: PointerEvent) => {
        const d = drag.current;
        const s = sizeRef.current;
        if (!d || !s) return;
        const p = point(ev);
        const x = Math.max(0, Math.min(s.width, p.x + offX));
        const y = Math.max(0, Math.min(s.height, p.y + offY));
        d.dx = x - d.lastX;
        d.dy = y - d.lastY;
        d.lastX = x;
        d.lastY = y;
        node.fx = x;
        node.fy = y;
      };
      const up = () => {
        const d = drag.current;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        node.fx = null;
        node.fy = null;
        if (d) {
          const speed = Math.hypot(d.dx, d.dy);
          const scale = speed > THROW_MAX ? THROW_MAX / speed : 1;
          node.vx = d.dx * scale;
          node.vy = d.dy * scale;
          if (speed > 0) node.angle = Math.atan2(d.dy, d.dx);
        }
        drag.current = null;
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    [],
  );

  return { nodeRef, startDrag };
}
