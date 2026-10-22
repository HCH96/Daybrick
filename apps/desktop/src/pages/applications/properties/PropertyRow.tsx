import { useState } from "react";
import { PropertyTypeIcon } from "../../../components/icons/PropertyTypeIcons";
import type { PropertyDef, PropertyValue } from "../../../features/applications/types";
import PropertyMenu from "./PropertyMenu";
import PropertyValueEditor from "./PropertyValueEditor";

interface PropertyRowProps {
  property: PropertyDef;
  value: PropertyValue | undefined;
  onChange: (value: PropertyValue) => void;
}

/** 속성 한 줄: 왼쪽 이름(누르면 메뉴) + 오른쪽 값 칸 (목업: 이름 칸 150px) */
function PropertyRow({ property, value, onChange }: PropertyRowProps) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="prop-row">
      <button
        ref={setAnchor}
        type="button"
        className="prop-row__name"
        title="이름·종류 바꾸기, 삭제"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span className="prop-row__icon">
          <PropertyTypeIcon type={property.type} />
        </span>
        <span className="prop-row__label">{property.name}</span>
      </button>
      <div className="prop-row__value">
        {/* 종류가 바뀌면 편집기 안의 임시 상태(쓰던 숫자 등)를 버리고 새로 그린다 */}
        <PropertyValueEditor key={property.type} property={property} value={value} onChange={onChange} />
      </div>
      {menuOpen && anchor && <PropertyMenu property={property} anchor={anchor} onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

export default PropertyRow;
