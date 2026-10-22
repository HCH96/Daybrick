import { SmallCheckIcon } from "../../../../components/icons/CommonIcons";
import type { PropertyValue } from "../../../../features/applications/types";

interface CheckboxValueProps {
  checked: boolean;
  label: string;
  onChange: (value: PropertyValue) => void;
}

/** 체크박스 값: 누르면 켜고 끈다. 꺼진 상태는 없음(null)으로 저장한다 (R31) */
function CheckboxValue({ checked, label, onChange }: CheckboxValueProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={checked ? "prop-check prop-check--on" : "prop-check"}
      onClick={() => onChange(checked ? null : true)}
    >
      {checked && <SmallCheckIcon size={12} />}
    </button>
  );
}

export default CheckboxValue;
