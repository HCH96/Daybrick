import type { ReactNode } from "react";
import LineIcon from "../../../components/icons/LineIcon";
import type { AddableKind } from "../../../features/job-search/filterRules";
import type { FilterRule } from "../../../features/job-search/types";
import FilterAddRow from "./FilterAddRow";
import FilterRow from "./FilterRow";

/** 깔때기 (목업 icons.js의 i-filter) */
function FilterIcon() {
  return (
    <LineIcon size={16}>
      <path d="M3 5h18l-7 8v6l-4 2v-8z" />
    </LineIcon>
  );
}

interface FilterSwitchProps {
  rule: FilterRule;
  title: string;
  desc: string;
  disabled: boolean;
  onToggle: (rule: FilterRule) => void;
}

/** 판 위의 고정 스위치 줄 (기술스택 자동 추림 R44, 개발 직군만 R98). 지울 수 없고 켜고 끄기만 한다 */
export function FilterSwitch({ rule, title, desc, disabled, onToggle }: FilterSwitchProps) {
  return (
    <div className="js-filters__auto">
      <button
        type="button"
        role="switch"
        aria-checked={rule.enabled}
        aria-label={`${title} ${rule.enabled ? "끄기" : "켜기"}`}
        className={`js-filters__switch${rule.enabled ? " js-filters__switch--on" : ""}`}
        disabled={disabled}
        onClick={() => onToggle(rule)}
      />
      <div className={`js-filters__rule-main${rule.enabled ? "" : " js-filters__rule-main--off"}`}>
        <b>{title}</b>
        <div className="js-filters__sub">{desc}</div>
      </div>
    </div>
  );
}

interface FilterPanelProps {
  title: string;
  tag: string;
  desc: string;
  rules: FilterRule[];
  kinds: AddableKind[];
  disabled: boolean;
  /** 조건 목록 위의 고정 줄 (2차의 기술스택 자동 추림·개발 직군만, `FilterSwitch`) */
  top?: ReactNode;
  onToggle: (rule: FilterRule) => void;
  onDelete: (rule: FilterRule) => void;
  onAdd: (kind: AddableKind, value: unknown) => Promise<boolean>;
}

/** 1차·2차 필터 판 하나 (R42–R45): 제목, 설명, 조건 줄들, 추가 줄 */
function FilterPanel({ title, tag, desc, rules, kinds, disabled, top, onToggle, onDelete, onAdd }: FilterPanelProps) {
  return (
    <section className="js-filters__panel" aria-label={title}>
      <h2 className="js-filters__panel-title">
        <FilterIcon />
        {title}
        <span className="js-filters__chip">{tag}</span>
      </h2>
      <p className="js-filters__panel-desc">{desc}</p>
      {top}
      {rules.length === 0 && <p className="js-filters__empty">조건이 없어요. 아래에서 추가해 주세요.</p>}
      {rules.map((rule) => (
        <FilterRow
          key={rule.id}
          rule={rule}
          disabled={disabled}
          onToggle={() => onToggle(rule)}
          onDelete={() => onDelete(rule)}
        />
      ))}
      <FilterAddRow kinds={kinds} disabled={disabled} onAdd={onAdd} />
    </section>
  );
}

export default FilterPanel;
