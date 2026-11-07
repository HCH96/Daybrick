import { useNavigation } from "../../app/navigation";
import { ServerIcon } from "../icons/ServerIcons";
import "../../pages/server-setup/wizard/WizardShell.css";
import "./ServerRequired.css";

interface ServerRequiredProps {
  /** 이 화면이 서버에 무엇을 하는지 한 줄 */
  description?: string;
}

/**
 * 서버가 필요한 화면에 넣는 "서버 연결 필요" 표시 (R40, D1). 누르면 설정 → 서버 연결로 간다.
 * 서버 연결 기능에서는 쓰는 화면이 없고, 이후 기능이 연결 안 함일 때 넣는다.
 */
function ServerRequired({ description = "이 기능은 내 Supabase 서버에 데이터를 저장합니다" }: ServerRequiredProps) {
  const { navigate } = useNavigation();
  return (
    <div className="server-required">
      <span className="server-required__icon">
        <ServerIcon />
      </span>
      <div className="server-required__text">
        <b>서버 연결 필요</b>
        <span>{description}</span>
      </div>
      <button type="button" className="setup-btn setup-btn--primary" onClick={() => navigate("settings")}>
        설정에서 연결하기
      </button>
    </div>
  );
}

export default ServerRequired;
