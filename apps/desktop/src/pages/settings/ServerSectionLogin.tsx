import { RefreshIcon, WarnIcon } from "../../components/icons/ServerIcons";
import { loginFailMessage } from "../../features/server/messages";
import { useServer } from "../../features/server/useServer";
import GoogleButton from "../server-setup/wizard/GoogleButton";
import "../server-setup/wizard/WizardFields.css";
import ServerDangerRow from "./ServerDangerRow";
import { useSettingsLogin, type SettingsLogin } from "./useSettingsLogin";
import "./ServerSectionConnected.css";

/** 로그인 계정 줄 오른쪽: 상태에 따라 [Google로 로그인] / 기다리는 중 / [지금 다시 확인] */
function LoginAction({ login }: { login: SettingsLogin }) {
  const { status, checking, recheck } = useServer();
  if (status !== "login-needed") {
    // 일시정지·접속 불가(또는 첫 확인 전)면 로그인보다 접속 확인이 먼저다
    return (
      <button type="button" className="settings-btn settings-btn--sm" onClick={recheck} disabled={checking}>
        <RefreshIcon size={14} />
        {checking ? "확인 중…" : "지금 다시 확인"}
      </button>
    );
  }
  if (login.phase.kind === "waiting") {
    return (
      <span className="settings-login-wait">
        브라우저에서 로그인을 마쳐 주세요
        <button type="button" className="settings-link" onClick={login.reopen}>
          다시 열기
        </button>
        <button type="button" className="settings-link" onClick={login.cancel}>
          취소
        </button>
      </span>
    );
  }
  return <GoogleButton small onClick={login.start} />;
}

/**
 * 서버 연결 칸: 연결 정보는 있는데 로그인하지 않았을 때 (R32).
 * 로그아웃 후·토큰 만료·다른 PC. [Google로 로그인]에 성공하면 연결됨 칸으로 바뀐다.
 */
function ServerSectionLogin({ url }: { url: string }) {
  const { status } = useServer();
  const login = useSettingsLogin();
  const failure = login.phase.kind === "failed" ? loginFailMessage(login.phase.error) : null;
  let account = "로그인하지 않음";
  if (status === "connected") account = "확인 중…";
  else if (status !== "login-needed") account = "서버에 접속하면 확인합니다";

  return (
    <>
      <div className="settings-rows">
        <div className="settings-row">
          <span className="settings-row__k">서버 주소</span>
          <span className="settings-row__v settings-row__v--mono">{url.replace(/^https?:\/\//, "")}</span>
          <span />
        </div>
        <div className="settings-row">
          <span className="settings-row__k">로그인 계정</span>
          <span className="settings-row__v settings-row__v--faint">{account}</span>
          <LoginAction login={login} />
        </div>
      </div>
      {failure && (
        <div className="settings-card__pad settings-card__pad--top">
          <div className="wiz-alert wiz-alert--bad" role="alert">
            <span className="wiz-alert__icon">
              <WarnIcon size={16} />
            </span>
            <div>
              <b>{failure.title}</b>
              <p>{failure.desc}</p>
            </div>
          </div>
        </div>
      )}
      <ServerDangerRow hint="로그인 전에는 서버 기능을 쓸 수 없습니다." withSwitch={false} />
    </>
  );
}

export default ServerSectionLogin;
