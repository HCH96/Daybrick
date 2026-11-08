import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import type { PropertyDef } from "../../../features/applications/types";
import OptionChip from "../properties/OptionChip";

interface ResultPickerProps {
  /** 결과 속성 (역할 "result", 선택 종류) */
  property: PropertyDef;
  /** 지금 고른 항목 id */
  value: string | null;
  onPick: (optionId: string) => void;
  /** "나중에 고르기": 아무것도 바꾸지 않고 닫는다 */
  onLater: () => void;
}

/** 종료로 바꾸면 바로 뜨는 결과 고르기 (R20). 항목은 결과 속성의 항목 그대로 (사용자가 추가한 것 포함). */
function ResultPicker({ property, value, onPick, onLater }: ResultPickerProps) {
  return (
    <div className="result-picker">
      <p className="result-picker__question">어떻게 끝났나요?</p>
      {property.options.map((o, i) => (
        <button
          key={o.id}
          type="button"
          className={o.id === value ? "pop-row pop-row--active" : "pop-row"}
          autoFocus={value ? o.id === value : i === 0}
          onClick={() => onPick(o.id)}
        >
          <OptionChip name={o.name} color={o.color} />
          {o.id === value && (
            <span className="pop-row__check">
              <SmallCheckIcon size={16} />
            </span>
          )}
        </button>
      ))}
      <button type="button" className="pop-row" onClick={onLater}>
        <span className="result-picker__later">나중에 고르기</span>
      </button>
    </div>
  );
}

export default ResultPicker;
