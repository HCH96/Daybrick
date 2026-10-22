import { convertValue, mapPropertyValues, removeOptionFromValue } from "./propertyOps";
import type { ApplicationsData, PropertyDef, PropertyOption, PropertyType } from "./types";

/** 속성 정의(모든 카드가 공유)를 바꾸는 동작들 (R28~R30) */
export type PropertyAction =
  | { type: "add-property"; property: PropertyDef }
  | { type: "rename-property"; propertyId: string; name: string }
  | { type: "change-property-type"; propertyId: string; propertyType: PropertyType }
  | { type: "delete-property"; propertyId: string }
  | { type: "add-option"; propertyId: string; option: PropertyOption }
  | { type: "update-option"; propertyId: string; optionId: string; patch: Partial<Pick<PropertyOption, "name" | "color">> }
  | { type: "delete-option"; propertyId: string; optionId: string };

/** 속성 동작을 적용한 새 데이터. 바뀐 것이 없으면 원래 객체를 그대로 돌려준다. */
export function reduceProperties(data: ApplicationsData, action: PropertyAction): ApplicationsData {
  switch (action.type) {
    case "add-property":
      return { ...data, properties: [...data.properties, action.property] };

    case "rename-property":
      return updateProperty(data, action.propertyId, (p) => (p.name === action.name ? p : { ...p, name: action.name }));

    case "change-property-type": {
      const property = data.properties.find((p) => p.id === action.propertyId);
      // 역할 속성은 종류를 바꾸지 않는다 (계획 결정 3). 화면에서도 막지만 한 번 더 지킨다.
      if (!property || property.role !== null || property.type === action.propertyType) return data;
      const from = property.type;
      const to = action.propertyType;
      // 항목 목록은 남겨 둔다: 선택으로 다시 바꾸면 그대로 쓸 수 있게
      const next = updateProperty(data, property.id, (p) => ({ ...p, type: to }));
      return { ...next, applications: mapPropertyValues(next.applications, property.id, (v) => convertValue(v, from, to)) };
    }

    case "delete-property": {
      if (!data.properties.some((p) => p.id === action.propertyId)) return data;
      return {
        ...data,
        properties: data.properties.filter((p) => p.id !== action.propertyId),
        applications: mapPropertyValues(data.applications, action.propertyId, () => null),
      };
    }

    case "add-option":
      return updateProperty(data, action.propertyId, (p) => ({ ...p, options: [...p.options, action.option] }));

    case "update-option":
      return updateProperty(data, action.propertyId, (p) => ({
        ...p,
        options: p.options.map((o) => (o.id === action.optionId ? { ...o, ...action.patch } : o)),
      }));

    case "delete-option": {
      const next = updateProperty(data, action.propertyId, (p) => ({
        ...p,
        options: p.options.filter((o) => o.id !== action.optionId),
      }));
      if (next === data) return data;
      return {
        ...next,
        applications: mapPropertyValues(next.applications, action.propertyId, (v) => removeOptionFromValue(v, action.optionId)),
      };
    }
  }
}

function updateProperty(data: ApplicationsData, propertyId: string, update: (p: PropertyDef) => PropertyDef): ApplicationsData {
  let changed = false;
  const properties = data.properties.map((p) => {
    if (p.id !== propertyId) return p;
    const next = update(p);
    if (next !== p) changed = true;
    return next;
  });
  return changed ? { ...data, properties } : data;
}
