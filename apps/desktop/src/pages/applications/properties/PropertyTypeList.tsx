import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { PropertyTypeIcon } from "../../../components/icons/PropertyTypeIcons";
import { PROPERTY_TYPES } from "../../../features/applications/propertyTypes";
import type { PropertyType } from "../../../features/applications/types";

interface PropertyTypeListProps {
  /** 지금 종류 (체크 표시). 새로 만들 때는 null */
  current: PropertyType | null;
  disabled?: boolean;
  onPick: (type: PropertyType) => void;
}

/** 속성 종류 7가지 목록 (R29). 속성 추가 창과 속성 메뉴가 같이 쓴다. */
function PropertyTypeList({ current, disabled = false, onPick }: PropertyTypeListProps) {
  return (
    <div className="type-list" role="menu" aria-label="속성 종류">
      {PROPERTY_TYPES.map((t) => (
        <button
          key={t.type}
          type="button"
          role="menuitemradio"
          aria-checked={t.type === current}
          className="pop-row"
          disabled={disabled && t.type !== current}
          onClick={() => onPick(t.type)}
        >
          <span className="pop-row__label">
            <span className="type-list__icon">
              <PropertyTypeIcon type={t.type} />
            </span>
            {t.label}
          </span>
          {t.type === current && (
            <span className="pop-row__check">
              <SmallCheckIcon size={16} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default PropertyTypeList;
