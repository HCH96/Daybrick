import { useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { hexToHsv, hsvToHex, normalizeHex, type Hsv } from "../../../features/plan/color";
import "./ColorPicker.css";

interface ColorPickerProps {
  /** 지금 고른 색 "#RRGGBB" (항상 올바른 값) */
  value: string;
  onChange: (color: string) => void;
  /** 최근 쓴 색 (최대 8개) */
  recentColors: string[];
}

/**
 * 자유 색 선택기 (R7, D9): 색 평면(가로 채도·세로 밝기), 색상 막대, 색 값 입력, 최근 쓴 색.
 * 평면·막대는 포인터로 누르거나 끌어 고른다. 색 값이 잘못되면 빨간 테두리만 보이고 적용하지 않는다.
 * 큰 견본은 부르는 쪽(CategoryForm)이 이름 칸 옆에 그린다.
 */
function ColorPicker({ value, onChange, recentColors }: ColorPickerProps) {
  // 채도·밝기가 0이 되어도 색상을 잃지 않게 hsv를 따로 들고 있는다
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [hexText, setHexText] = useState(value);
  const [hexInvalid, setHexInvalid] = useState(false);

  // 바깥(최근 색 등)에서 값이 바뀌면 따라간다
  const [shown, setShown] = useState(value);
  if (shown !== value) {
    setShown(value);
    if (hsvToHex(hsv) !== value) setHsv(hexToHsv(value));
    setHexText(value);
    setHexInvalid(false);
  }

  const apply = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setShown(hex);
    setHexText(hex);
    setHexInvalid(false);
    // 끄는 동안 이 함수는 누를 때의 value를 보고 있으므로 비교하지 않고 늘 알린다
    onChange(hex);
  };

  const onPlane = dragHandler((x, y) => apply({ h: hsv.h, s: x, v: 1 - y }));
  const onHue = dragHandler((x) => apply({ ...hsv, h: Math.min(x * 360, 359.9) }));

  const style = { "--hue": hsvToHex({ h: hsv.h, s: 1, v: 1 }) } as CSSProperties;

  return (
    <div className="color-picker" style={style}>
      <div className="color-picker__plane" onPointerDown={onPlane} aria-label="채도·밝기" role="presentation">
        <i style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
      </div>
      <div className="color-picker__hue" onPointerDown={onHue} aria-label="색상" role="presentation">
        <i style={{ left: `${(hsv.h / 360) * 100}%` }} />
      </div>
      <input
        className={hexInvalid ? "pop-input color-picker__hex color-picker__hex--invalid" : "pop-input color-picker__hex"}
        value={hexText}
        aria-label="색 값"
        aria-invalid={hexInvalid}
        spellCheck={false}
        onChange={(e) => {
          setHexText(e.target.value);
          const hex = normalizeHex(e.target.value);
          setHexInvalid(hex === null);
          if (hex && hex !== value) {
            setHsv(hexToHsv(hex));
            setShown(hex);
            onChange(hex);
          }
        }}
        onBlur={() => {
          setHexText(value);
          setHexInvalid(false);
        }}
      />
      {recentColors.length > 0 && (
        <div className="color-picker__recent">
          최근
          {recentColors.map((c) => (
            <button
              key={c}
              type="button"
              className={c === value ? "color-picker__chip color-picker__chip--on" : "color-picker__chip"}
              style={{ background: c }}
              aria-label={`최근 색 ${c}`}
              title={c}
              onClick={() => onChange(c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 누른 자리와 끄는 자리를 요소 안의 0–1 비율로 알려 준다.
 * 포인터를 붙잡아(setPointerCapture) 요소 밖으로 나가도 계속 받는다.
 */
function dragHandler(onPoint: (x: number, y: number) => void) {
  return (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const el = e.currentTarget;
    const point = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      onPoint(clamp01((clientX - r.left) / r.width), clamp01((clientY - r.top) / r.height));
    };
    point(e.clientX, e.clientY);
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => point(ev.clientX, ev.clientY);
    const end = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export default ColorPicker;
