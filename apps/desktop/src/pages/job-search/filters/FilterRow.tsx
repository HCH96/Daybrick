import { TrashIcon } from "../../../components/icons/DialogIcons";
import { KIND_INFO, isAddableKind, ruleChips } from "../../../features/job-search/filterRules";
import type { FilterRule } from "../../../features/job-search/types";

interface FilterRowProps {
  rule: FilterRule;
  disabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

/** 조건 한 줄 (R45): 스위치 + 종류 + 값 칩 + 휴지통. 꺼진 조건은 흐리게 */
function FilterRow({ rule, disabled, onToggle, onDelete }: FilterRowProps) {
  if (!isAddableKind(rule.kind)) return null;
  const info = KIND_INFO[rule.kind];
  const chips = ruleChips(rule);
  return (
    <div className={`js-filters__rule${rule.enabled ? "" : " js-filters__rule--off"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={rule.enabled}
        aria-label={`${info.label} ${rule.enabled ? "끄기" : "켜기"}`}
        className={`js-filters__switch${rule.enabled ? " js-filters__switch--on" : ""}`}
        disabled={disabled}
        onClick={onToggle}
      />
      <div className="js-filters__rule-main">
        <div className="js-filters__rule-kind">{info.label}</div>
        <div className="js-filters__vals">
          {chips.length === 0 && <span className="js-filters__sub">값 없음</span>}
          {chips.map((chip) => (
            <span key={chip} className={`js-filters__chip js-filters__chip--${info.tone}`}>
              {chip}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="js-filters__x"
        aria-label={`${info.label} 조건 삭제`}
        title="삭제"
        disabled={disabled}
        onClick={onDelete}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export default FilterRow;
