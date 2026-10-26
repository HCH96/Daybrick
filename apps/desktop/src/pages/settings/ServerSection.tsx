import { ServerIcon } from "../../components/icons/ServerIcons";
import { useServer } from "../../features/server/useServer";
import ServerSectionOff from "./ServerSectionOff";

/** 설정의 "서버 연결" 칸. 머리(아이콘·제목·상태) + 상태별 본문. */
function ServerSection() {
  const { config, status } = useServer();
  const connected = status === "connected";

  return (
    <section className="settings-card">
      <div className="settings-card__head">
        <span className="settings-card__icon">
          <ServerIcon />
        </span>
        <h3 className="settings-card__title">
          서버 연결<small>내 Supabase 서버와 로그인</small>
        </h3>
        <div className="settings-card__right">
          {config !== null && (
            <span className={`settings-state settings-state--${connected ? "ok" : "none"}`}>
              {connected ? "연결됨" : "연결 안 함"}
            </span>
          )}
        </div>
      </div>
      {/* 연결됨 본문은 9단계(ServerSectionConnected)에서 만든다 */}
      {config !== null && !connected && <ServerSectionOff />}
    </section>
  );
}

export default ServerSection;
