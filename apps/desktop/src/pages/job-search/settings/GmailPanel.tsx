import { useCallback, useEffect, useState } from "react";
import { disconnectGmail, loadGmailStatus, type GmailStatus } from "../../../features/job-search/gmailApi";
import { cancelGmailConnect, connectGmail } from "../../../features/job-search/gmailConnect";
import {
  GMAIL_ACCOUNT_NOTE,
  GMAIL_BROKEN,
  GMAIL_CONNECTED,
  GMAIL_DESC,
  GMAIL_DISCONNECT_NOTE,
  GMAIL_DISCONNECTED,
  GMAIL_REVOKE_FAILED,
  GMAIL_TOKEN_NOTE,
  GMAIL_UNVERIFIED_STEPS,
  GMAIL_UNVERIFIED_TITLE,
  GMAIL_WAITING,
  gmailConnectErrorMessage,
  gmailDisconnectErrorMessage,
  gmailStatusErrorMessage,
} from "../../../features/job-search/messages";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import { openLoginPage } from "../../../features/server/googleLogin";
import { useServer } from "../../../features/server/useServer";
import { MailIcon } from "./SettingsIcons";
import SaveResult, { type SaveState } from "./SaveResult";
import "./GmailPanel.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** ISO 시각 → `10/27 (화) 07:00` */
function checkedAt(iso: string): string {
  const d = new Date(iso);
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]}) ${hm}`;
}

/** "확인되지 않은 앱" 경고를 넘기는 방법 (R61) */
function UnverifiedGuide() {
  return (
    <div className="js-gmail__guide">
      <b>{GMAIL_UNVERIFIED_TITLE}</b>
      <ol>
        {GMAIL_UNVERIFIED_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

/** 설정 탭 Gmail 연결 판 (R60–R63, R70): 연결 상태·이메일·마지막 확인, [Gmail 연결]/[연결 해제] */
function GmailPanel() {
  const { session } = useJobSearch();
  const { config } = useServer();
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [result, setResult] = useState<SaveState>(null);

  const reload = useCallback(async () => {
    const loaded = await loadGmailStatus(session);
    if (loaded.ok) {
      setStatus(loaded.value);
      setLoadError(null);
    } else {
      setLoadError(gmailStatusErrorMessage(loaded.error));
    }
  }, [session]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // 판을 떠나면 기다리던 연결을 멈춘다
  useEffect(() => () => cancelGmailConnect(), []);

  async function connect() {
    const connection = config?.connection;
    if (!connection) return;
    setBusy(true);
    setResult(null);
    const connected = await connectGmail(session, connection, setLoginUrl);
    setLoginUrl(null);
    setBusy(false);
    setResult(connected.ok ? { ok: true, text: GMAIL_CONNECTED } : { ok: false, text: gmailConnectErrorMessage(connected.failure) });
    await reload();
  }

  async function disconnect() {
    setBusy(true);
    setResult(null);
    const done = await disconnectGmail(session);
    setBusy(false);
    if (!done.ok) setResult({ ok: false, text: gmailDisconnectErrorMessage(done.error) });
    else setResult(done.value.revoked ? { ok: true, text: GMAIL_DISCONNECTED } : { ok: false, text: GMAIL_REVOKE_FAILED });
    await reload();
  }

  function body() {
    if (loginUrl !== null) {
      return (
        <>
          <div className="js-settings__hint">{GMAIL_WAITING}</div>
          <div className="js-settings__actions">
            <button type="button" className="setup-btn" onClick={() => openLoginPage(loginUrl)}>
              브라우저 다시 열기
            </button>
            <button type="button" className="setup-btn setup-btn--ghost" onClick={cancelGmailConnect}>
              취소
            </button>
          </div>
          <UnverifiedGuide />
        </>
      );
    }
    if (!status) {
      return (
        <div className="js-settings__actions">
          <span className="js-settings__sub">{loadError ?? "연결 상태를 읽는 중…"}</span>
          {loadError && (
            <button type="button" className="setup-btn" onClick={() => void reload()}>
              다시 시도
            </button>
          )}
        </div>
      );
    }
    if (status.state === "off") {
      return (
        <>
          <div className="js-settings__hint">{GMAIL_ACCOUNT_NOTE}</div>
          <div className="js-settings__actions">
            <button
              type="button"
              className="setup-btn setup-btn--primary"
              disabled={busy || !config?.connection}
              onClick={() => void connect()}
            >
              <MailIcon />
              Gmail 연결
            </button>
          </div>
          <UnverifiedGuide />
        </>
      );
    }
    const broken = status.state === "broken";
    const email = status.email ?? session.email ?? "";
    return (
      <>
        <div className="js-gmail__acct">
          <span className="js-gmail__avatar">{(email[0] ?? "G").toUpperCase()}</span>
          <div className="js-gmail__acct-main">
            <b>{email}</b>
            <span className="js-settings__sub">앱 로그인 계정과 같음 · gmail.readonly</span>
          </div>
          <span className={`js-gmail__chip js-gmail__chip--${broken ? "red" : "green"}`}>
            {broken ? "다시 연결 필요" : "연결됨"}
          </span>
        </div>
        {broken && <div className="js-gmail__warn">{GMAIL_BROKEN}</div>}
        <dl className="js-gmail__kv">
          <dt>마지막 확인</dt>
          <dd>{status.lastCheckedAt ? checkedAt(status.lastCheckedAt) : "아직 확인하지 않았어요"}</dd>
          <dt>토큰 저장</dt>
          <dd>{GMAIL_TOKEN_NOTE}</dd>
        </dl>
        <div className="js-settings__actions">
          {broken && (
            <button type="button" className="setup-btn setup-btn--primary" disabled={busy} onClick={() => void connect()}>
              다시 연결
            </button>
          )}
          <button type="button" className="setup-btn js-gmail__danger" disabled={busy} onClick={() => void disconnect()}>
            연결 해제
          </button>
          <span className="js-settings__sub">{GMAIL_DISCONNECT_NOTE}</span>
        </div>
        {broken && <UnverifiedGuide />}
      </>
    );
  }

  return (
    <section className="js-settings__panel">
      <h3 className="js-settings__title">
        <MailIcon />
        Gmail 연결
      </h3>
      <p className="js-settings__desc">{GMAIL_DESC}</p>
      {body()}
      <SaveResult state={result} />
    </section>
  );
}

export default GmailPanel;
