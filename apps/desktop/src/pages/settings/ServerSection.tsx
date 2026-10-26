import { ServerIcon } from "../../components/icons/ServerIcons";
import AppUpdateNotice from "../../components/server/AppUpdateNotice";
import { SETTINGS_STATE } from "../../features/server/messages";
import { useSchemaPair } from "../../features/server/serverUpdate";
import { useServer } from "../../features/server/useServer";
import ServerSectionConnected from "./ServerSectionConnected";
import ServerSectionLogin from "./ServerSectionLogin";
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

/**
 * 설정의 "서버 연결" 칸. 머리(아이콘·제목·상태 점과 글자, R40 색) + 상태별 본문.
 * 연결 안 함 → Off, 앱 업데이트 필요 → 안내, 로그인돼 있으면 → Connected, 아니면 → 로그인 필요 (R32, R46–R49).
 */
function ServerSection() {
  const { config, status, session } = useServer();
  const connection = config?.connection ?? null;
  const state = SETTINGS_STATE[connection ? status : "off"];

  let body = null;
  if (config !== null) {
    if (!connection) body = <ServerSectionOff />;
    else if (status === "app-update") body = <ServerSectionAppUpdate url={connection.url} anonKey={connection.anonKey} />;
    else if (session) body = <ServerSectionConnected session={session} url={connection.url} />;
    else body = <ServerSectionLogin url={connection.url} />;
  }

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
      {body}
    </section>
  );
}

export default ServerSection;
