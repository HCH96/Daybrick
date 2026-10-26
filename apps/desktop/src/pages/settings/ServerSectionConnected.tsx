import { useState } from "react";
import { KeyIcon, RefreshIcon } from "../../components/icons/ServerIcons";
import type { ServerSession } from "../../features/server/session";
import { useServer } from "../../features/server/useServer";
import { parseSupabaseUrl } from "../../features/server/validate";
import KeyReplaceDialog from "./KeyReplaceDialog";
import RerunSetupDialog from "./RerunSetupDialog";
import ServerDangerRow from "./ServerDangerRow";
import { formatDay, formatDayTime, useServerDetails, type ServerDetails } from "./useServerDetails";
import "./ServerSectionConnected.css";

/** 서버 구조 줄: "서버 1 / 앱 1" + 최신 여부. 서버가 뒤처지면 [업데이트] */
function SchemaRow({ details, onUpdate }: { details: ServerDetails | null; onUpdate: () => void }) {
  const server = details?.server ? (details.server.schema ?? 0) : null;
  const app = details?.appSchema ?? null;
  let note = "확인 중…";
  if (details && server === null) note = "서버 번호를 읽지 못함";
  else if (server !== null && app !== null) note = server === app ? "최신" : server < app ? "서버 업데이트 필요" : "앱 업데이트 필요";
  return (
    <div className="settings-row">
      <span className="settings-row__k">서버 구조</span>
      <span className="settings-row__v">
        <span className="settings-ver">
          서버 <b>{server ?? "–"}</b> / 앱 <b>{app ?? "–"}</b>
        </span>
        <small>{note}</small>
      </span>
      {server !== null && app !== null && server < app ? (
        <button type="button" className="settings-btn settings-btn--sm" onClick={onUpdate}>
          업데이트
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

interface ServerSectionConnectedProps {
  session: ServerSession;
  url: string;
}

/**
 * 서버 연결 칸: 로그인돼 있을 때 (R47–R49).
 * 마지막 접속·주소·계정·서버 구조·Anthropic 키(값 없이 등록일만) + 관리 버튼, 맨 아래 위험한 버튼 줄.
 */
function ServerSectionConnected({ session, url }: ServerSectionConnectedProps) {
  const { config, checking, recheck, logout, openUpdate } = useServer();
  const lastAt = config?.lastCheck?.at ?? null;
  const details = useServerDetails(session, lastAt);
  const [dialog, setDialog] = useState<"key" | "rerun" | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = parseSupabaseUrl(url)?.ref ?? null;
  const keyAt = details?.server?.keyRegisteredAt ?? null;
  const email = session.email ?? details?.server?.email ?? null;

  const onLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  return (
    <>
      <div className="settings-rows">
        <div className="settings-row">
          <span className="settings-row__k">마지막 접속</span>
          <span className="settings-row__v">
            {lastAt ? formatDayTime(lastAt) : "–"}
            <small>앱을 켤 때마다 확인</small>
          </span>
          <button type="button" className="settings-btn settings-btn--sm" onClick={recheck} disabled={checking}>
            <RefreshIcon size={14} />
            {checking ? "확인 중…" : "지금 다시 확인"}
          </button>
        </div>
        <div className="settings-row">
          <span className="settings-row__k">서버 주소</span>
          <span className="settings-row__v settings-row__v--mono">{url}</span>
          <span />
        </div>
        <div className="settings-row">
          <span className="settings-row__k">로그인 계정</span>
          <span className="settings-row__v">
            {email ?? "이메일 없음"}
            <small>Google</small>
          </span>
          <button type="button" className="settings-btn settings-btn--sm" onClick={() => void onLogout()} disabled={loggingOut}>
            로그아웃
          </button>
        </div>
        <SchemaRow details={details} onUpdate={openUpdate} />
        <div className="settings-row">
          <span className="settings-row__k">Anthropic 키</span>
          <span className="settings-row__v">
            {keyAt ? (
              <>
                <span className="settings-pill settings-pill--ok">등록됨</span>
                <small>{formatDay(keyAt)} 등록</small>
              </>
            ) : (
              <span className="settings-pill settings-pill--none">{details ? "등록일 모름" : "확인 중…"}</span>
            )}
          </span>
          <button type="button" className="settings-btn settings-btn--sm" onClick={() => setDialog("key")} disabled={!ref}>
            <KeyIcon size={14} />
            교체
          </button>
        </div>
      </div>

      <div className="settings-actions">
        <button type="button" className="settings-btn settings-btn--sm" onClick={() => setDialog("rerun")} disabled={!ref}>
          <RefreshIcon size={14} />
          자동 세팅 다시 실행
        </button>
        <span className="settings-actions__help">로그인 설정·서버 함수가 망가졌을 때 복구용. 데이터는 그대로입니다.</span>
      </div>

      <ServerDangerRow
        hint="이 PC에 저장한 주소·로그인 정보만 지웁니다. 서버의 데이터는 지워지지 않습니다."
        withSwitch
      />

      {dialog === "key" && ref && (
        <KeyReplaceDialog
          session={session}
          projectRef={ref}
          registeredDay={keyAt ? formatDay(keyAt) : null}
          onReplaced={recheck}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "rerun" && ref && (
        <RerunSetupDialog session={session} projectRef={ref} onFinished={recheck} onClose={() => setDialog(null)} />
      )}
    </>
  );
}

export default ServerSectionConnected;
