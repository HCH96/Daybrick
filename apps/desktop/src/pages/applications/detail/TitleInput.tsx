import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import "./TitleInput.css";

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 팝업 맨 위 제목. 긴 제목은 줄을 바꿔 보여주되, 줄바꿈 문자는 넣지 않는다.
 * Enter를 누르면 편집을 마친다. 제목이 비어 있으면 열자마자 바로 쓸 수 있게 포커스를 둔다.
 */
function TitleInput({ value, onChange }: TitleInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // 내용에 맞춰 높이를 늘리고 줄인다
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
      className="title-input"
      value={value}
      placeholder="제목 없음"
      rows={1}
      spellCheck={false}
      aria-label="제목"
      autoFocus={value === ""}
      onChange={(e) => onChange(e.target.value.replace(/[\r\n]+/g, " "))}
      onKeyDown={onKeyDown}
    />
  );
}

export default TitleInput;
