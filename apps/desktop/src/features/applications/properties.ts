import type { Application, PropertyDef, PropertyOption, PropertyRole } from "./types";

/** 역할이 있는 기본 속성을 찾는다. 사용자가 지웠으면 null. */
export function findPropertyByRole(properties: readonly PropertyDef[], role: PropertyRole): PropertyDef | null {
  return properties.find((p) => p.role === role) ?? null;
}

/** 날짜 속성 값("YYYY-MM-DD"). 속성이 없거나 값이 없으면 null. */
export function getDateValue(application: Application, property: PropertyDef | null): string | null {
  if (!property || property.type !== "date") return null;
  const value = application.values[property.id];
  return typeof value === "string" && value !== "" ? value : null;
}

/** 선택 속성에서 고른 항목. 속성이 없거나 값이 없거나 항목이 지워졌으면 null. */
export function getSelectedOption(application: Application, property: PropertyDef | null): PropertyOption | null {
  if (!property || property.type !== "select") return null;
  const value = application.values[property.id];
  if (typeof value !== "string") return null;
  return property.options.find((o) => o.id === value) ?? null;
}
