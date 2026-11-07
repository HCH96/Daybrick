import type { CSSProperties } from "react";
import { SmallCloseIcon } from "../../../components/icons/CommonIcons";
import { optionColorVars } from "../../../features/applications/propertyTypes";
import type { OptionColor } from "../../../features/applications/types";
import "./OptionChip.css";

interface OptionChipProps {
  name: string;
  color: OptionColor;
  /** 있으면 칩 안에 ✕ 버튼을 붙인다 (고른 항목 빼기) */
  onRemove?: () => void;
}

/** 선택 항목 칩: 둥근 사각형. 상태 배지(알약 + 점)와 모양을 다르게 해서 구분한다 (목업) */
function OptionChip({ name, color, onRemove }: OptionChipProps) {
  const vars = optionColorVars(color);
  const style = { "--chip-color": vars.text, "--chip-bg": vars.bg } as CSSProperties;
  return (
    <span className="option-chip" style={style}>
      <span className="option-chip__name">{name}</span>
      {onRemove && (
        <button
          type="button"
          className="option-chip__remove"
          aria-label={`${name} 빼기`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <SmallCloseIcon size={12} />
        </button>
      )}
    </span>
  );
}

export default OptionChip;
