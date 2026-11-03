import { useState, type CSSProperties } from "react";
import ColorPicker from "../../plan/list/ColorPicker";

/** 기본 색 7개 (목업 part-create.html의 swatches) */
export const PROJECT_COLORS = ["#A68CFF", "#7AA8FF", "#66CF95", "#F0B860", "#F29AD3", "#FF8A8A", "#5FD0D4"];

interface ColorChoiceProps {
  value: string;
  onChange: (color: string) => void;
  recentColors: string[];
}

/**
 * 프로젝트 색 고르기 (프로젝트 R9, D12): 기본 색 7개 + `직접 고르기`(플랜 색 선택기).
 * 만들기 창과 카드의 이름·색 바꾸기가 같이 쓴다. 기본 색이 아닌 색이면 처음부터 선택기를 펼친다.
 */
function ColorChoice({ value, onChange, recentColors }: ColorChoiceProps) {
  const isPreset = PROJECT_COLORS.includes(value.toUpperCase());
  const [custom, setCustom] = useState(!isPreset);

  return (
    <div className="proj-color">
      <div className="proj-color__swatches" role="radiogroup" aria-label="색">
        {PROJECT_COLORS.map((color) => {
          const on = !custom && value.toUpperCase() === color;
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={color}
              className={on ? "proj-color__sw proj-color__sw--on" : "proj-color__sw"}
              style={{ "--sw": color } as CSSProperties}
              onClick={() => {
                setCustom(false);
                onChange(color);
              }}
            />
          );
        })}
        <button
          type="button"
          className={custom ? "proj-color__more proj-color__more--on" : "proj-color__more"}
          aria-expanded={custom}
          onClick={() => setCustom((v) => !v)}
        >
          {custom && <span className="proj-color__now" style={{ background: value }} />}
          직접 고르기
        </button>
      </div>
      {custom && <ColorPicker value={value} onChange={onChange} recentColors={recentColors} />}
    </div>
  );
}

export default ColorChoice;
