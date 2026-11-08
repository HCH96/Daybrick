import { ArrowUpIcon, ServerIcon } from "../../components/icons/ServerIcons";
import { useServer } from "../../features/server/useServer";
import type { SyncBlocked } from "../../features/sync/useSync";

/** 이유별 안내 문구 (R32) */
const NOTICE: Record<Exclude<SyncBlocked, null>, { title: string; desc: string }> = {
  off: { title: "서버가 연결되어 있지 않습니다", desc: "서버를 연결하면 데이터를 내 서버에 올려 둘 수 있습니다." },
  login: { title: "로그인이 필요합니다", desc: "위 서버 연결 칸에서 Google로 로그인하면 동기화를 켤 수 있습니다." },
  "server-update": {
    title: "서버 업데이트 필요",
    desc: "동기화에 필요한 서버 구조(10번)가 없습니다. 업데이트 전까지는 이 PC에만 저장합니다.",
  },
  "app-update": { title: "앱 업데이트 필요", desc: "서버가 앱보다 새 버전입니다. 앱을 업데이트한 뒤 동기화할 수 있습니다." },
};

/** 동기화를 켤 수 없는 이유와 할 일 (R7, R32). 이때 스위치는 켤 수 없다 */
function SyncNotice({ blocked }: { blocked: Exclude<SyncBlocked, null> }) {
  const { openSetup, openUpdate } = useServer();
  const notice = NOTICE[blocked];
  return (
    <div className="settings-empty sync-notice">
      <div className="settings-empty__txt">
        <b>{notice.title}</b>
        <p className="sync-notice__desc">{notice.desc}</p>
      </div>
      {blocked === "off" && (
        <button type="button" className="settings-btn settings-btn--primary" onClick={openSetup}>
          <ServerIcon size={16} />
          서버 연결 시작
        </button>
      )}
      {blocked === "server-update" && (
        <button type="button" className="settings-btn settings-btn--primary" onClick={openUpdate}>
          <ArrowUpIcon size={16} />
          서버 업데이트
        </button>
      )}
    </div>
  );
}

export default SyncNotice;
