import { useState } from "react";
import Popover from "../../../../components/common/Popover";
import type { PropertyDef, PropertyOption, PropertyValue } from "../../../../features/applications/types";
import OptionChip from "../OptionChip";
import OptionPicker from "../OptionPicker";

interface SelectValueProps {
  property: PropertyDef;
  /** 고른 항목 id들 (선택이면 0~1개) */
  selected: readonly string[];
  multi: boolean;
  onChange: (value: PropertyValue) => void;
}

/** 선택·다중 선택 값: 고른 항목을 칩으로 보여주고, 누르면 항목 고르기 창을 연다 */
function SelectValue({ property, selected, multi, onChange }: SelectValueProps) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  // 지워진 항목 id는 보여주지 않는다
  const options = selected
    .map((id) => property.options.find((o) => o.id === id))
    .filter((o): o is PropertyOption => o !== undefined);

  const change = (ids: string[]) => {
    if (multi) onChange(ids.length > 0 ? ids : null);
    else onChange(ids[0] ?? null);
  };

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        className={options.length > 0 ? "prop-cell prop-cell--chips" : "prop-cell prop-cell--empty"}
        aria-label={`${property.name}: ${options.length > 0 ? options.map((o) => o.name).join(", ") : "비어 있음"}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {options.length > 0 ? options.map((o) => <OptionChip key={o.id} name={o.name} color={o.color} />) : "비어 있음"}
      </button>
      {open && anchor && (
        <Popover anchor={anchor} onClose={() => setOpen(false)} width={280} ariaLabel={`${property.name} 고르기`}>
          <OptionPicker
            property={property}
            selected={selected}
            multi={multi}
            onChange={change}
            onDone={() => setOpen(false)}
          />
        </Popover>
      )}
    </>
  );
}

export default SelectValue;
