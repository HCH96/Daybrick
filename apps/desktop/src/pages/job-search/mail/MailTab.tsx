import { useCallback, useEffect, useState } from "react";
import { useApplications } from "../../../features/applications/store";
import { applySuggestion, findSuggestionCard } from "../../../features/job-search/applySuggestion";
import { loadGmailStatus, type GmailStatus } from "../../../features/job-search/gmailApi";
import {
  checkMailNow,
  loadMailTab,
  setSuggestionState,
  type MailSuggestion,
  type MailTabData,
} from "../../../features/job-search/mailApi";
import {
  APPLICATIONS_NOT_READY,
  CARD_NOT_FOUND,
  MAIL_BROKEN,
  MAIL_CHECKING,
  MAIL_NOT_CONNECTED,
  NO_SUGGESTIONS,
  gmailStatusErrorMessage,
  mailCheckCallErrorMessage,
  mailCheckDoneMessage,
  mailCheckFailMessage,
  mailLoadErrorMessage,
  suggestionSaveErrorMessage,
} from "../../../features/job-search/messages";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import { MailIcon } from "../settings/SettingsIcons";
import DoneList from "./DoneList";
import SuggestionCard from "./SuggestionCard";
import { dateTime } from "./mailFormat";
import "./MailTab.css";

type Status = { ok: boolean; text: string } | null;

interface MailTabProps {
  /** 대기 중 제안 수가 바뀌면 탭 칩을 고치게 알린다 */
  onPendingChange: (count: number) => void;
}

/** 위쪽 줄: 연결 상태 칩·마지막 확인·대기 개수·[지금 확인] (R64) */
function MailBar({
  gmail,
  data,
  checking,
  onCheck,
}: {
  gmail: GmailStatus | null;
  data: MailTabData | null;
  checking: boolean;
  onCheck: () => void;
}) {
  const connected = gmail?.state === "connected";
  const chip = !gmail ? null : gmail.state === "connected" ? "green" : gmail.state === "broken" ? "red" : "";
  const chipText = gmail?.state === "connected" ? "Gmail 연결됨" : gmail?.state === "broken" ? "다시 연결 필요" : "Gmail 연결 안 됨";
  const lastChecked = gmail && gmail.state !== "off" && gmail.lastCheckedAt ? dateTime(gmail.lastCheckedAt) : null;
  return (
    <div className="js-mail__bar">
      {chip !== null && (
        <span className={`js-mail__chip${chip ? ` js-mail__chip--${chip}` : ""}`}>
          <MailIcon />
          {chipText}
        </span>
      )}
      {connected && (
        <span>
          마지막 확인 {lastChecked ?? "아직 없음"}
          {data && ` · 지원 건 ${data.openApplications}개와 맞는 메일만 확인`}
        </span>
      )}
      <span className="js-mail__bar-right">
        {data && (
          <span>
            대기 중 제안 <b>{data.pending.length}</b>개
          </span>
        )}
        <button
          type="button"
          className="setup-btn setup-btn--sm setup-btn--primary"
          disabled={!connected || checking}
          onClick={onCheck}
        >
          지금 확인
        </button>
      </span>
    </div>
  );
}

/** 메일 제안 탭 (R64–R69): 위쪽 줄, 대기 중 제안 카드, 최근 30일 처리한 제안 */
function MailTab({ onPendingChange }: MailTabProps) {
  const { session, refresh } = useJobSearch();
  const applications = useApplications();
  const [gmail, setGmail] = useState<GmailStatus | null>(null);
  const [data, setData] = useState<MailTabData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);

  const reload = useCallback(async () => {
    const [g, d] = await Promise.all([loadGmailStatus(session), loadMailTab(session)]);
    if (g.ok) setGmail(g.value);
    if (!d.ok) {
      setLoadError(mailLoadErrorMessage(d.error));
      return;
    }
    setLoadError(g.ok ? null : gmailStatusErrorMessage(g.error));
    setData(d.value);
    onPendingChange(d.value.pending.length);
  }, [session, onPendingChange]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function check() {
    setChecking(true);
    setStatus({ ok: true, text: MAIL_CHECKING });
    const result = await checkMailNow(session);
    setChecking(false);
    if (!result.ok) setStatus({ ok: false, text: mailCheckCallErrorMessage(result.error) });
    else if (!result.value.ok) setStatus({ ok: false, text: mailCheckFailMessage(result.value.reason) });
    else {
      const { scanned, matched, suggested, stopped } = result.value;
      setStatus({ ok: stopped === null, text: mailCheckDoneMessage(scanned, matched, suggested, stopped) });
    }
    await Promise.all([reload(), refresh()]);
  }

  async function handle(s: MailSuggestion, approve: boolean) {
    setStatus(null);
    if (approve && applications.state.kind !== "ready") {
      setStatus({ ok: false, text: APPLICATIONS_NOT_READY });
      return;
    }
    // 승인할 카드가 없으면 거절로 처리한다 (R68)
    const missing = approve && applications.state.kind === "ready" && !findSuggestionCard(applications.state.data.applications, s);
    setBusyId(s.id);
    const saved = await setSuggestionState(session, s.id, approve && !missing ? "approved" : "rejected");
    setBusyId(null);
    if (!saved.ok) {
      setStatus({ ok: false, text: suggestionSaveErrorMessage(saved.error) });
      return;
    }
    if (missing) setStatus({ ok: false, text: CARD_NOT_FOUND });
    else if (approve) applySuggestion(applications, s);
    await reload();
  }

  function list() {
    if (!data) return <p className="js-mail__sub">{loadError ?? "메일 제안을 읽는 중…"}</p>;
    if (data.pending.length === 0) return <div className="js-mail__empty">{NO_SUGGESTIONS}</div>;
    return (
      <div className="js-mail__sugs">
        {data.pending.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            busy={busyId !== null}
            onApprove={() => void handle(s, true)}
            onReject={() => void handle(s, false)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="js-mail">
      <MailBar gmail={gmail} data={data} checking={checking} onCheck={() => void check()} />
      {gmail?.state === "off" && <p className="js-mail__msg">{MAIL_NOT_CONNECTED}</p>}
      {gmail?.state === "broken" && <p className="js-mail__msg js-mail__msg--bad">{MAIL_BROKEN}</p>}
      {data && loadError && <p className="js-mail__msg js-mail__msg--bad">{loadError}</p>}
      {status && (
        <p className={`js-mail__msg js-mail__msg--${status.ok ? "ok" : "bad"}`} role="status">
          {status.text}
        </p>
      )}
      {list()}
      {data && <DoneList items={data.done} />}
    </div>
  );
}

export default MailTab;
