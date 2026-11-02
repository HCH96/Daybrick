import { useState } from "react";
import StatusDot from "../StatusDot";

interface InlineTaskInputProps {
  /** Enter로 적은 제목 (앞뒤 빈칸은 부르는 쪽에서 정리해도 된다) */
  onSubmit: (title: string) => void;
  onClose: () => void;
  /** true(기본)면 만든 뒤에도 입력칸을 비우고 이어서 적는다. false면 하나 만들고 닫는다 (5단계 달력 더블클릭). */
  keepOpen?: boolean;
  placeholder?: string;
}

/**
 * 태스크 줄 자리에 바로 적는 입력칸 (목업 list-inline, R17).
 * Enter → 만들기, Esc 또는 빈 칸으로 포커스를 잃으면 닫는다.
 */
function InlineTaskInput({ onSubmit, onClose, keepOpen = true, placeholder = "새 태스크 제목" }: InlineTaskInputProps) {
  const [value, setValue] = useState("");

  return (
    <div className="plan-task plan-task--input">
      <StatusDot status="todo" />
      <div className="plan-task__main">
        <input
          className="plan-field plan-field--inline"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return; // 한글 조합 중 Enter·Esc는 조합용
            if (e.key === "Enter") {
              e.preventDefault();
              if (!value.trim()) return;
              onSubmit(value.trim());
              if (keepOpen) setValue("");
              else onClose();
            } else if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }
          }}
          onBlur={() => {
            if (!value.trim()) onClose();
          }}
        />
      </div>
    </div>
  );
}

export default InlineTaskInput;
