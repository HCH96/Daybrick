import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./Personal.css";

interface QuickInputProps {
  style: CSSProperties; // 주 줄 그리드 안 자리
  placeholder?: string;
  /** 입력칸 아래 안내 앞에 붙일 글자 (기간 입력의 "11/23 – 11/25 · 3일") */
  hintLead?: ReactNode;
  /** 안내를 입력칸 위에 띄운다 (맨 아래 주) */
  hintAbove?: boolean;
  /** Enter. 제목은 다듬어 비어 있지 않은 것만 넘긴다 */
  onSubmit: (title: string) => void;
  /** Esc, 빈 제목 Enter, 바깥 누르기 */
  onCancel: () => void;
}

/**
 * 칩 모양 제목 입력칸 (목업 part-personal 5-1, R23). 열리면 바로 글자를 받는다.
 * Enter = 저장, Esc·빈 제목·바깥 누르기(포커스를 잃음) = 취소. 한글 조합 중 Enter는 무시한다.
 */
function QuickInput({ style, placeholder, hintLead, hintAbove = false, onSubmit, onCancel }: QuickInputProps) {
  const [title, setTitle] = useState("");
  const done = useRef(false);

  const finish = (save: boolean) => {
    if (done.current) return;
    done.current = true;
    const trimmed = title.trim();
    if (save && trimmed !== "") onSubmit(trimmed);
    else onCancel();
  };

  return (
    <div className="cal-pin" style={style}>
      <input
        className="cal-pin__field"
        autoFocus
        value={title}
        placeholder={placeholder}
        aria-label={placeholder ?? "일정 제목"}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => finish(false)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") {
            e.preventDefault();
            finish(true);
          } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            finish(false);
          }
        }}
      />
      <div className={hintAbove ? "cal-pin__hint cal-pin__hint--above" : "cal-pin__hint"}>
        {hintLead}
        <span className="cal-pin__kbd">Enter</span>저장 · <span className="cal-pin__kbd">Esc</span>취소
      </div>
    </div>
  );
}

export default QuickInput;
