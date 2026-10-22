import { OPTION_COLORS } from "../../../features/applications/propertyTypes";
import type { OptionColor } from "../../../features/applications/types";

interface ColorPaletteProps {
  value: OptionColor;
  onChange: (color: OptionColor) => void;
}

/** 선택 항목 8색 고르기 (R30): 회색·파랑·주황·초록·빨강·보라·청록·분홍 */
function ColorPalette({ value, onChange }: ColorPaletteProps) {
  return (
    <div className="color-palette" role="radiogroup" aria-label="항목 색">
      {OPTION_COLORS.map((c) => (
        <button
          key={c.color}
          type="button"
          role="radio"
          aria-checked={c.color === value}
          aria-label={c.label}
          title={c.label}
          className={c.color === value ? "color-palette__swatch color-palette__swatch--on" : "color-palette__swatch"}
          style={{ background: c.text }}
          onClick={() => onChange(c.color)}
        />
      ))}
    </div>
  );
}

export default ColorPalette;
