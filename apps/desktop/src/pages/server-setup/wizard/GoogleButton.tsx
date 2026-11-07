import { GoogleIcon } from "../../../components/icons/ServerIcons";
import "./GoogleButton.css";

interface GoogleButtonProps {
  onClick: () => void;
  label?: string;
  small?: boolean;
  disabled?: boolean;
}

/** [Google로 로그인] 버튼: 흰 바탕 + Google 아이콘. 마법사와 설정 화면에서 함께 쓴다 (R32, R51). */
function GoogleButton({ onClick, label = "Google로 로그인", small = false, disabled = false }: GoogleButtonProps) {
  return (
    <button
      type="button"
      className={small ? "google-btn google-btn--sm" : "google-btn"}
      onClick={onClick}
      disabled={disabled}
    >
      <GoogleIcon size={16} />
      {label}
    </button>
  );
}

export default GoogleButton;
