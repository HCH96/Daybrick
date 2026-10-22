import type { Application, OptionColor, PropertyDef, PropertyOption, PropertyType, PropertyValue } from "./types";

/** 사용자가 추가하는 새 속성 (기본 속성 아님, 역할 없음) */
export function createPropertyDef(name: string, type: PropertyType): PropertyDef {
  return { id: crypto.randomUUID(), name, type, options: [], builtin: false, role: null };
}

export function createOption(name: string, color: OptionColor): PropertyOption {
  return { id: crypto.randomUUID(), name, color };
}

/**
 * 속성 종류를 바꿀 때 기존 값을 새 종류에 맞게 옮긴다. 옮길 수 없으면 null(없음).
 * - 선택 ↔ 다중 선택: 항목을 그대로 쓴다 (다중 → 단일은 첫 항목만)
 * - 텍스트 ↔ URL: 글자를 그대로 쓴다
 * - 숫자 → 텍스트: 숫자를 글자로
 * - 그 밖에는 지운다
 */
export function convertValue(value: PropertyValue, from: PropertyType, to: PropertyType): PropertyValue {
  if (value === null || from === to) return value;
  if (from === "select" && to === "multi-select" && typeof value === "string") return [value];
  if (from === "multi-select" && to === "select" && Array.isArray(value)) return value[0] ?? null;
  const isTextLike = (t: PropertyType) => t === "text" || t === "url";
  if (isTextLike(from) && isTextLike(to)) return value;
  if (from === "number" && isTextLike(to) && typeof value === "number") return String(value);
  return null;
}

/** 모든 카드에서 한 속성의 값을 바꾼다. 바뀐 카드가 없으면 원래 배열을 그대로 돌려준다. */
export function mapPropertyValues(
  applications: Application[],
  propertyId: string,
  map: (value: PropertyValue) => PropertyValue,
): Application[] {
  let changed = false;
  const next = applications.map((a) => {
    if (!(propertyId in a.values)) return a;
    const before = a.values[propertyId];
    const after = map(before);
    if (after === before) return a;
    changed = true;
    return { ...a, values: withValue(a.values, propertyId, after) };
  });
  return changed ? next : applications;
}

/** 값 목록에 하나를 넣는다. null(없음)이면 칸을 아예 지워 파일을 작게 유지한다. */
export function withValue(
  values: Record<string, PropertyValue>,
  propertyId: string,
  value: PropertyValue,
): Record<string, PropertyValue> {
  const next = { ...values };
  if (value === null) delete next[propertyId];
  else next[propertyId] = value;
  return next;
}

/** 지운 항목을 값에서 뺀다 (선택: 없음으로, 다중 선택: 목록에서 제거) */
export function removeOptionFromValue(value: PropertyValue, optionId: string): PropertyValue {
  if (value === optionId) return null;
  if (Array.isArray(value) && value.includes(optionId)) {
    const rest = value.filter((id) => id !== optionId);
    return rest.length > 0 ? rest : null;
  }
  return value;
}

/** 이 항목을 쓰는 카드 수 (항목을 지우기 전 확인 문구용) */
export function countOptionUsage(applications: readonly Application[], property: PropertyDef, optionId: string): number {
  return applications.filter((a) => {
    const value = a.values[property.id];
    return value === optionId || (Array.isArray(value) && value.includes(optionId));
  }).length;
}
