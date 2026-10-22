import type { ReactNode } from "react";
import "./SegmentedControl.css";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number; // 이름 옆에 작게 붙는 개수 (예: 진행 중 8)
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** buttons: 붙어 있는 버튼 묶음 (갤러리 | 달력), tabs: 밑줄 탭 (진행 중 | 종료 | 전체) */
  variant?: "buttons" | "tabs";
}

/** 여러 개 중 하나를 고르는 전환 버튼 */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  variant = "buttons",
}: SegmentedControlProps<T>) {
  const base = variant === "tabs" ? "segmented-tabs" : "segmented";
  return (
    <div className={base} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? `${base}__item ${base}__item--on` : `${base}__item`}
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined && <span className={`${base}__count`}>{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
