import { ServerIcon } from "../../components/icons/ServerIcons";
import { useServer } from "../../features/server/useServer";

/** 서버로 쓸 수 있는 기능 (설명용 목록) */
const SERVER_FEATURES = ["알림", "구직 관리 (공고 정리, 메일 확인)", "다른 PC와 데이터 이어 쓰기"];

/** 서버 연결 칸: 연결 안 함 상태. [서버 연결 시작]은 첫 실행 안내와 같은 연결 마법사를 연다 (R46). */
function ServerSectionOff() {
  const { openSetup } = useServer();
  return (
    <div className="settings-empty">
      <div className="settings-empty__txt">
        <b>서버를 연결하면 쓸 수 있는 것</b>
        <ul>
          {SERVER_FEATURES.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
      <button type="button" className="settings-btn settings-btn--primary" onClick={openSetup}>
        <ServerIcon size={16} />
        서버 연결 시작
      </button>
    </div>
  );
}

export default ServerSectionOff;
