import type { OptionColor, PropertyDef, PropertyType } from "./types";

/** 속성 종류 7가지와 이름 (R29). 순서 = 종류 고르는 목록 순서. */
export const PROPERTY_TYPES: readonly { type: PropertyType; label: string }[] = [
  { type: "text", label: "텍스트" },
  { type: "number", label: "숫자" },
  { type: "select", label: "선택" },
  { type: "multi-select", label: "다중 선택" },
  { type: "date", label: "날짜" },
  { type: "url", label: "URL" },
  { type: "checkbox", label: "체크박스" },
];

export function propertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPES.find((t) => t.type === type)?.label ?? type;
}

/** 선택 항목 8색. 순서 = 팔레트 순서 (목업). 값은 theme.css의 CSS 변수. */
export const OPTION_COLORS: readonly { color: OptionColor; label: string; text: string; bg: string }[] = [
  { color: "gray", label: "회색", text: "var(--neutral)", bg: "var(--neutral-soft)" },
  { color: "blue", label: "파랑", text: "var(--blue)", bg: "var(--blue-soft)" },
  { color: "amber", label: "주황", text: "var(--amber)", bg: "var(--amber-soft)" },
  { color: "green", label: "초록", text: "var(--green)", bg: "var(--green-soft)" },
  { color: "red", label: "빨강", text: "var(--red)", bg: "var(--red-soft)" },
  { color: "violet", label: "보라", text: "var(--violet)", bg: "var(--violet-soft)" },
  { color: "teal", label: "청록", text: "var(--teal)", bg: "var(--teal-soft)" },
  { color: "pink", label: "분홍", text: "var(--pink)", bg: "var(--pink-soft)" },
];

export function optionColorVars(color: OptionColor): { text: string; bg: string } {
  const found = OPTION_COLORS.find((c) => c.color === color) ?? OPTION_COLORS[0];
  return { text: found.text, bg: found.bg };
}

/** 새 항목에 처음 줄 색: 항목 수에 따라 팔레트를 차례로 돈다 (나중에 직접 바꿀 수 있음) */
export function nextOptionColor(property: PropertyDef): OptionColor {
  return OPTION_COLORS[property.options.length % OPTION_COLORS.length].color;
}

/** 종류를 바꿀 수 있는지. 앱 기능이 쓰는 역할 속성은 막는다 (계획 결정 3). */
export function canChangeType(property: PropertyDef): boolean {
  return property.role === null;
}
