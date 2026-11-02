/** 카테고리 색 계산 (색 선택기, R7·D9). 색은 "#RRGGBB" 대문자로 저장한다. */

/** h: 색상 0–360, s: 채도 0–1, v: 밝기 0–1 */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

/** 미분류 점 색 (TaskList.css의 plan-group--none과 같은 값) */
export const NONE_CATEGORY_COLOR = "#8a8a96";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** "#RRGGBB" 모양인지 */
export function isHexColor(value: string): boolean {
  return HEX_RE.test(value);
}

/** 입력한 글자를 "#RRGGBB" 대문자로 바꾼다. 앞의 #는 없어도 된다. 잘못된 값이면 null. */
export function normalizeHex(text: string): string | null {
  const trimmed = text.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return isHexColor(withHash) ? withHash.toUpperCase() : null;
}

export function hexToHsv(hex: string): Hsv {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const hue = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = v - c;
  let rgb: [number, number, number];
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return `#${rgb.map((n) => toHex(n + m)).join("")}`;
}

function toHex(n: number): string {
  const value = Math.round(Math.max(0, Math.min(1, n)) * 255);
  return value.toString(16).padStart(2, "0").toUpperCase();
}
