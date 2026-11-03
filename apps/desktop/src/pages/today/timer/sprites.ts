/**
 * 타이머 트랙 도트 캐릭터 (14×16 픽셀, 화면에서는 3배 42×48, timer-visual.md).
 * 좌표는 목업 human/mockups/sprites.js(사용자 시안 Bar/Pause/Goal.dc.html)를 그대로 옮겼다. stand만 목업에서 새로 그림.
 * 상의는 `fill: "var(--c)"`: 감싼 요소의 카테고리 색(D7)을 따른다.
 */
export interface SpriteRect {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  opacity?: number;
}

export type SpriteName = "run1" | "run2" | "sit" | "cheer" | "stand";

const run1: SpriteRect[] = [
  { x: 3, y: 8, w: 1, h: 2, fill: "var(--c)" },
  { x: 3, y: 8, w: 1, h: 2, fill: "#000", opacity: 0.35 },
  { x: 2, y: 10, w: 1, h: 1, fill: "#D9A97E" },
  { x: 3, y: 13, w: 1, h: 1, fill: "#3F4652" },
  { x: 2, y: 14, w: 1, h: 1, fill: "#3F4652" },
  { x: 0, y: 14, w: 2, h: 1, fill: "#E5E7EB" },
  { x: 0, y: 15, w: 2, h: 1, fill: "#8B8D94" },
  { x: 4, y: 0, w: 5, h: 1, fill: "#3B2A20" },
  { x: 3, y: 1, w: 7, h: 1, fill: "#3B2A20" },
  { x: 2, y: 2, w: 3, h: 1, fill: "#3B2A20" },
  { x: 3, y: 3, w: 1, h: 2, fill: "#3B2A20" },
  { x: 5, y: 2, w: 5, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 3, w: 6, h: 3, fill: "#F2C9A0" },
  { x: 4, y: 5, w: 3, h: 1, fill: "#D9A97E" },
  { x: 8, y: 3, w: 1, h: 2, fill: "#1C1D22" },
  { x: 9, y: 5, w: 1, h: 1, fill: "#F29B8B" },
  { x: 6, y: 6, w: 2, h: 1, fill: "#D9A97E" },
  { x: 4, y: 7, w: 5, h: 3, fill: "var(--c)" },
  { x: 4, y: 7, w: 1, h: 3, fill: "#000", opacity: 0.25 },
  { x: 5, y: 7, w: 3, h: 1, fill: "#fff", opacity: 0.3 },
  { x: 4, y: 10, w: 5, h: 1, fill: "#2A2B31" },
  { x: 4, y: 11, w: 5, h: 2, fill: "#4B5563" },
  { x: 4, y: 11, w: 1, h: 2, fill: "#3F4652" },
  { x: 8, y: 13, w: 2, h: 1, fill: "#4B5563" },
  { x: 9, y: 14, w: 1, h: 1, fill: "#4B5563" },
  { x: 9, y: 15, w: 2, h: 1, fill: "#E5E7EB" },
  { x: 11, y: 15, w: 1, h: 1, fill: "#8B8D94" },
  { x: 9, y: 8, w: 1, h: 1, fill: "var(--c)" },
  { x: 10, y: 8, w: 1, h: 1, fill: "#F2C9A0" },
  { x: 11, y: 7, w: 1, h: 1, fill: "#F2C9A0" },
];

const run2: SpriteRect[] = [
  { x: 3, y: 13, w: 1, h: 1, fill: "#3F4652" },
  { x: 1, y: 13, w: 2, h: 1, fill: "#E5E7EB" },
  { x: 1, y: 14, w: 2, h: 1, fill: "#8B8D94" },
  { x: 4, y: 0, w: 5, h: 1, fill: "#3B2A20" },
  { x: 3, y: 1, w: 7, h: 1, fill: "#3B2A20" },
  { x: 2, y: 2, w: 3, h: 1, fill: "#3B2A20" },
  { x: 3, y: 3, w: 1, h: 2, fill: "#3B2A20" },
  { x: 5, y: 2, w: 5, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 3, w: 6, h: 3, fill: "#F2C9A0" },
  { x: 4, y: 5, w: 3, h: 1, fill: "#D9A97E" },
  { x: 8, y: 3, w: 1, h: 2, fill: "#1C1D22" },
  { x: 9, y: 5, w: 1, h: 1, fill: "#F29B8B" },
  { x: 6, y: 6, w: 2, h: 1, fill: "#D9A97E" },
  { x: 4, y: 7, w: 5, h: 3, fill: "var(--c)" },
  { x: 4, y: 7, w: 1, h: 3, fill: "#000", opacity: 0.25 },
  { x: 5, y: 7, w: 3, h: 1, fill: "#fff", opacity: 0.3 },
  { x: 7, y: 8, w: 1, h: 1, fill: "#000", opacity: 0.25 },
  { x: 8, y: 9, w: 2, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 10, w: 5, h: 1, fill: "#2A2B31" },
  { x: 4, y: 11, w: 5, h: 2, fill: "#4B5563" },
  { x: 4, y: 11, w: 1, h: 2, fill: "#3F4652" },
  { x: 4, y: 13, w: 1, h: 1, fill: "#3F4652" },
  { x: 6, y: 13, w: 2, h: 2, fill: "#4B5563" },
  { x: 6, y: 15, w: 2, h: 1, fill: "#E5E7EB" },
  { x: 8, y: 15, w: 1, h: 1, fill: "#8B8D94" },
];

const sit: SpriteRect[] = [
  { x: 4, y: 4, w: 5, h: 1, fill: "#3B2A20" },
  { x: 3, y: 5, w: 7, h: 1, fill: "#3B2A20" },
  { x: 2, y: 6, w: 3, h: 1, fill: "#3B2A20" },
  { x: 3, y: 7, w: 1, h: 2, fill: "#3B2A20" },
  { x: 5, y: 6, w: 5, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 7, w: 6, h: 3, fill: "#F2C9A0" },
  { x: 4, y: 9, w: 3, h: 1, fill: "#D9A97E" },
  { x: 7, y: 8, w: 2, h: 1, fill: "#1C1D22" },
  { x: 9, y: 9, w: 1, h: 1, fill: "#F29B8B" },
  { x: 6, y: 10, w: 2, h: 1, fill: "#D9A97E" },
  { x: 4, y: 11, w: 5, h: 3, fill: "var(--c)" },
  { x: 4, y: 11, w: 1, h: 3, fill: "#000", opacity: 0.25 },
  { x: 5, y: 11, w: 3, h: 1, fill: "#fff", opacity: 0.3 },
  { x: 9, y: 12, w: 1, h: 1, fill: "var(--c)" },
  { x: 9, y: 12, w: 1, h: 1, fill: "#000", opacity: 0.2 },
  { x: 10, y: 13, w: 1, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 14, w: 8, h: 1, fill: "#4B5563" },
  { x: 4, y: 14, w: 1, h: 1, fill: "#3F4652" },
  { x: 4, y: 15, w: 4, h: 1, fill: "#3F4652" },
  { x: 12, y: 14, w: 2, h: 1, fill: "#E5E7EB" },
  { x: 12, y: 15, w: 2, h: 1, fill: "#8B8D94" },
];

const cheer: SpriteRect[] = [
  { x: 2, y: 4, w: 1, h: 1, fill: "#F2C9A0" },
  { x: 2, y: 5, w: 1, h: 2, fill: "#D9A97E" },
  { x: 3, y: 7, w: 1, h: 1, fill: "var(--c)" },
  { x: 3, y: 7, w: 1, h: 1, fill: "#000", opacity: 0.35 },
  { x: 4, y: 0, w: 5, h: 1, fill: "#3B2A20" },
  { x: 3, y: 1, w: 7, h: 1, fill: "#3B2A20" },
  { x: 3, y: 2, w: 2, h: 1, fill: "#3B2A20" },
  { x: 3, y: 3, w: 1, h: 2, fill: "#3B2A20" },
  { x: 5, y: 2, w: 5, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 3, w: 6, h: 3, fill: "#F2C9A0" },
  { x: 4, y: 5, w: 2, h: 1, fill: "#D9A97E" },
  { x: 7, y: 4, w: 1, h: 1, fill: "#1C1D22" },
  { x: 8, y: 3, w: 1, h: 1, fill: "#1C1D22" },
  { x: 9, y: 4, w: 1, h: 1, fill: "#1C1D22" },
  { x: 8, y: 5, w: 1, h: 1, fill: "#B5524A" },
  { x: 6, y: 5, w: 1, h: 1, fill: "#F29B8B" },
  { x: 6, y: 6, w: 2, h: 1, fill: "#D9A97E" },
  { x: 4, y: 7, w: 5, h: 3, fill: "var(--c)" },
  { x: 4, y: 7, w: 1, h: 3, fill: "#000", opacity: 0.25 },
  { x: 5, y: 7, w: 3, h: 1, fill: "#fff", opacity: 0.3 },
  { x: 9, y: 7, w: 1, h: 1, fill: "var(--c)" },
  { x: 10, y: 5, w: 1, h: 2, fill: "#F2C9A0" },
  { x: 10, y: 4, w: 1, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 10, w: 5, h: 1, fill: "#2A2B31" },
  { x: 4, y: 11, w: 5, h: 2, fill: "#4B5563" },
  { x: 4, y: 11, w: 1, h: 2, fill: "#3F4652" },
  { x: 5, y: 13, w: 1, h: 2, fill: "#4B5563" },
  { x: 7, y: 13, w: 1, h: 2, fill: "#4B5563" },
  { x: 4, y: 15, w: 2, h: 1, fill: "#E5E7EB" },
  { x: 7, y: 15, w: 2, h: 1, fill: "#E5E7EB" },
];

const stand: SpriteRect[] = [
  { x: 4, y: 0, w: 5, h: 1, fill: "#3B2A20" },
  { x: 3, y: 1, w: 7, h: 1, fill: "#3B2A20" },
  { x: 2, y: 2, w: 3, h: 1, fill: "#3B2A20" },
  { x: 3, y: 3, w: 1, h: 2, fill: "#3B2A20" },
  { x: 5, y: 2, w: 5, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 3, w: 6, h: 3, fill: "#F2C9A0" },
  { x: 4, y: 5, w: 3, h: 1, fill: "#D9A97E" },
  { x: 8, y: 3, w: 1, h: 2, fill: "#1C1D22" },
  { x: 9, y: 5, w: 1, h: 1, fill: "#F29B8B" },
  { x: 6, y: 6, w: 2, h: 1, fill: "#D9A97E" },
  { x: 4, y: 7, w: 5, h: 3, fill: "var(--c)" },
  { x: 4, y: 7, w: 1, h: 3, fill: "#000", opacity: 0.25 },
  { x: 5, y: 7, w: 3, h: 1, fill: "#fff", opacity: 0.3 },
  { x: 3, y: 8, w: 1, h: 2, fill: "var(--c)" },
  { x: 3, y: 8, w: 1, h: 2, fill: "#000", opacity: 0.35 },
  { x: 3, y: 10, w: 1, h: 1, fill: "#D9A97E" },
  { x: 9, y: 8, w: 1, h: 2, fill: "var(--c)" },
  { x: 9, y: 8, w: 1, h: 2, fill: "#000", opacity: 0.2 },
  { x: 9, y: 10, w: 1, h: 1, fill: "#F2C9A0" },
  { x: 4, y: 10, w: 5, h: 1, fill: "#2A2B31" },
  { x: 4, y: 11, w: 5, h: 2, fill: "#4B5563" },
  { x: 4, y: 11, w: 1, h: 2, fill: "#3F4652" },
  { x: 5, y: 13, w: 1, h: 2, fill: "#4B5563" },
  { x: 7, y: 13, w: 1, h: 2, fill: "#4B5563" },
  { x: 4, y: 15, w: 2, h: 1, fill: "#E5E7EB" },
  { x: 7, y: 15, w: 2, h: 1, fill: "#E5E7EB" },
];

export const SPRITES: Record<SpriteName, SpriteRect[]> = { run1, run2, sit, cheer, stand };
