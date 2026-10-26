import { ServerIcon } from "../../components/icons/ServerIcons";
import AppUpdateNotice from "../../components/server/AppUpdateNotice";
import { useSchemaPair } from "../../features/server/serverUpdate";
import { useServer } from "../../features/server/useServer";
import ServerSectionOff from "./ServerSectionOff";

/** 앱 업데이트 필요 본문: 서버/앱 번호와 안내 (R24) */
function ServerSectionAppUpdate({ url, anonKey }: { url: string; anonKey: string }) {
  const pair = useSchemaPair(url, anonKey);
  return (
    <div className="settings-card__pad">
      <AppUpdateNotice serverSchema={pair ? pair.server : undefined} appSchema={pair?.app ?? null} />
    </div>
  );
}

/** 설정의 "서버 연결" 칸. 머리(아이콘·제목·상태) + 상태별 본문. */
function ServerSection() {
  const { config, status } = useServer();
  const connected = status === "connected";
  const appUpdate = status === "app-update";
  const connection = config?.connection ?? null;

  let state = { tone: "none", label: "연결 안 함" };
  if (connected) state = { tone: "ok", label: "연결됨" };
  else if (appUpdate) state = { tone: "warn", label: "앱 업데이트 필요" };

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
          {config !== null && <span className={`settings-state settings-state--${state.tone}`}>{state.label}</span>}
        </div>
      </div>
      {appUpdate && connection && <ServerSectionAppUpdate url={connection.url} anonKey={connection.anonKey} />}
      {/* 연결됨·그 밖의 상태 본문은 9단계(ServerSectionConnected)에서 만든다 */}
      {config !== null && !connected && !appUpdate && <ServerSectionOff />}
    </section>
  );
}

export default ServerSection;
