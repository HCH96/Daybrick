import type { PropertyDef, PropertyValue } from "../../../features/applications/types";
import CheckboxValue from "./editors/CheckboxValue";
import DateValue from "./editors/DateValue";
import NumberValue from "./editors/NumberValue";
import SelectValue from "./editors/SelectValue";
import TextValue from "./editors/TextValue";
import UrlValue from "./editors/UrlValue";
import "./PropertyValueEditor.css";

interface PropertyValueEditorProps {
  property: PropertyDef;
  value: PropertyValue | undefined; // 아직 한 번도 고치지 않은 칸은 undefined (= 없음)
  onChange: (value: PropertyValue) => void;
}

/*
 * 저장된 값은 종류와 모양이 어긋날 수도 있다(예: 파일을 직접 고친 경우).
 * 그래서 종류별로 기대하는 모양이 아니면 "없음"으로 보고 보여준다.
 */
const asString = (v: PropertyValue | undefined) => (typeof v === "string" ? v : "");
const asIds = (v: PropertyValue | undefined): string[] =>
  Array.isArray(v) ? v : typeof v === "string" ? [v] : [];

/** 속성 종류에 맞는 값 편집기 (R29, 7가지) */
function PropertyValueEditor({ property, value, onChange }: PropertyValueEditorProps) {
  const label = property.name;
  switch (property.type) {
    case "text":
      return <TextValue value={asString(value)} label={label} onChange={onChange} />;
    case "number":
      return <NumberValue value={typeof value === "number" ? value : null} label={label} onChange={onChange} />;
    case "select":
      return <SelectValue property={property} selected={asIds(value).slice(0, 1)} multi={false} onChange={onChange} />;
    case "multi-select":
      return <SelectValue property={property} selected={asIds(value)} multi onChange={onChange} />;
    case "date":
      return <DateValue value={asString(value) || null} label={label} onChange={onChange} />;
    case "url":
      return <UrlValue value={asString(value)} label={label} onChange={onChange} />;
    case "checkbox":
      return <CheckboxValue checked={value === true} label={label} onChange={onChange} />;
  }
}

export default PropertyValueEditor;
