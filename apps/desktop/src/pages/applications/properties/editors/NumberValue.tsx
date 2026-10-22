import { useState, type KeyboardEvent } from "react";
import type { PropertyValue } from "../../../../features/applications/types";

interface NumberValueProps {
  value: number | null;
  label: string;
  onChange: (value: PropertyValue) => void;
}

/** "1,200"·" 3.5 " 같은 입력을 숫자로. 숫자가 아니면 undefined */
function parseNumber(text: string): number | null | undefined {
  const cleaned = text.replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * 숫자 값: 쓰는 동안은 글자로 들고 있다가, 칸을 벗어나거나 Enter를 누를 때 숫자로 저장한다.
 * 숫자가 아니면 원래 값으로 되돌린다. 빈칸이면 없음(null).
 */
function NumberValue({ value, label, onChange }: NumberValueProps) {
  // 편집 중일 때만 draft를 쓴다 (편집 중이 아니면 저장된 값을 그대로 보여준다)
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && parseNumber(draft) === undefined;

  const commit = () => {
    if (draft === null) return;
    const parsed = parseNumber(draft);
    if (parsed !== undefined) onChange(parsed);
    setDraft(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) e.currentTarget.blur();
  };

  return (
    <input
      className={invalid ? "prop-input prop-input--invalid" : "prop-input"}
      type="text"
      inputMode="decimal"
      value={draft ?? (value === null ? "" : String(value))}
      placeholder="비어 있음"
      aria-label={label}
      aria-invalid={invalid}
      title={invalid ? "숫자만 쓸 수 있어요" : undefined}
      onFocus={() => setDraft(value === null ? "" : String(value))}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
}

export default NumberValue;
