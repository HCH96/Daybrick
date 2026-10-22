import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import type { PropertyValue } from "../../../../features/applications/types";

interface TextValueProps {
  value: string;
  label: string;
  onChange: (value: PropertyValue) => void;
}

/**
 * 텍스트 값: 칸을 눌러 바로 쓴다. 긴 글은 줄을 바꿔 보여주되 줄바꿈 문자는 넣지 않는다.
 * 빈칸이면 없음(null)으로 저장한다 (R31). Enter로 편집을 마친다.
 */
function TextValue({ value, label, onChange }: TextValueProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <textarea
      ref={ref}
      className="prop-input"
      value={value}
      rows={1}
      placeholder="비어 있음"
      spellCheck={false}
      aria-label={label}
      onChange={(e) => {
        const text = e.target.value.replace(/[\r\n]+/g, " ");
        onChange(text === "" ? null : text);
      }}
      onKeyDown={onKeyDown}
    />
  );
}

export default TextValue;
