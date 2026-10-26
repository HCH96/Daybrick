import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "../../../components/icons/ServerIcons";
import "./SecretInput.css";

/** 눈 아이콘으로 보여준 값을 다시 가리기까지의 시간 */
const REVEAL_MS = 5000;

interface SecretInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 테두리 상태: 확인 성공 초록, 오류 빨강 */
  state?: "ok" | "bad";
  onEnter?: () => void;
  ariaLabel?: string;
}

/** 비밀값 입력칸: ●로 가리고 눈 아이콘을 누르면 잠깐(5초) 보여준다. 값은 저장하지 않는다. */
function SecretInput({ id, value, onChange, placeholder, state, onEnter, ariaLabel }: SecretInputProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    const timer = window.setTimeout(() => setRevealed(false), REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [revealed]);

  return (
    <div className={state ? `wiz-input wiz-input--${state}` : "wiz-input"}>
      <input
        id={id}
        className="wiz-input__field"
        type={revealed ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
      />
      <button
        type="button"
        className="secret-input__eye"
        aria-label={revealed ? "값 가리기" : "값 잠깐 보기"}
        aria-pressed={revealed}
        onClick={() => setRevealed((v) => !v)}
      >
        {revealed ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
    </div>
  );
}

export default SecretInput;
