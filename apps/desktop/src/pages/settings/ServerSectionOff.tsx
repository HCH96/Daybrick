import { ServerIcon } from "../../components/icons/ServerIcons";

/** 서버로 쓸 수 있는 기능 (설명용 목록) */
const SERVER_FEATURES = ["알림", "구직 관리 (공고 정리, 메일 확인)", "다른 PC와 데이터 이어 쓰기"];

/** 서버 연결 칸: 연결 안 함 상태. [서버 연결 시작]은 2단계에서 첫 실행 흐름과 연결한다. */
function ServerSectionOff() {
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
      <button type="button" className="settings-btn settings-btn--primary">
        <ServerIcon size={15} />
        서버 연결 시작
      </button>
    </div>
  );
}

export default ServerSectionOff;
