import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { requestResume } from "../../features/server/management";
import {
  projectDashboardUrl,
  RESUME_REASON,
  resumeFailMessage,
  SUPABASE_DASHBOARD_URL,
} from "../../features/server/messages";
import type { ServerStatus } from "../../features/server/types";
import { useServer } from "../../features/server/useServer";
import { parseSupabaseUrl } from "../../features/server/validate";
import HelpToggle from "../../pages/server-setup/wizard/HelpToggle";
import SecretInput from "../../pages/server-setup/wizard/SecretInput";
import { FIELD_HELPS } from "../../pages/server-setup/wizard/guides";
import { openExternal } from "../../pages/server-setup/wizard/openExternal";
import { useDialogFocus } from "../common/useDialogFocus";
import { useEscapeLayer } from "../common/useEscapeLayer";
import { SmallCheckIcon, ExternalLinkIcon } from "../icons/CommonIcons";
import { CrossIcon, PauseIcon } from "../icons/ServerIcons";
import { useOverlayRoot } from "../layout/overlayRoot";
import "../../pages/server-setup/wizard/WizardShell.css";
import "../../pages/server-setup/wizard/WizardFields.css";
import "./ResumeDialog.css";

/** 다시 연결된 뒤 팝업을 닫기까지 */
const DONE_CLOSE_MS = 1500;

/** 켜지는 동안은 일시정지·접속 불가로 보일 수 있다 */
function stillDown(status: ServerStatus): boolean {
  return status === "paused" || status === "unreachable";
}

/**
 * 일시정지 재개 안내 팝업 (R42, R43, D8): 이유, 대시보드에서 재개, PAT로 여기서 재개.
 * 재개를 요청하면 진행 표시로 바뀌고, 닫아도 10초마다 확인은 계속된다. 켜지면 "다시 연결됐습니다" 뒤 닫힌다.
 */
function ResumeDialog({ onClose }: { onClose: () => void }) {
  const { config, status, resuming, resumeChecks, startResume } = useServer();
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);
  const [pat, setPat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ title: string; desc: string } | null>(null);
  // 이미 재개를 기다리는 중에 다시 열었으면 바로 진행 표시
  const [requested, setRequested] = useState(resuming);

  useEscapeLayer(onClose);
  useDialogFocus(boxRef);

  const ref = config?.connection ? (parseSupabaseUrl(config.connection.url)?.ref ?? null) : null;
  const done = requested && !resuming && !stillDown(status);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(onClose, DONE_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [done, onClose]);

  const beginWaiting = () => {
    setPat("");
    setError(null);
    setRequested(true);
    startResume();
  };

  const onDashboard = () => {
    openExternal(ref ? projectDashboardUrl(ref) : SUPABASE_DASHBOARD_URL);
    beginWaiting();
  };

  const onResumeHere = async () => {
    if (!ref || !pat.trim() || busy) return;
    setBusy(true);
    setError(null);
    const result = await requestResume(pat, ref);
    setBusy(false);
    if (result.kind === "failed") setError(resumeFailMessage(result.reason));
    else beginWaiting();
  };

  if (!root) return null;
  return createPortal(
    <div
      className="resume-layer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={boxRef}
        className="resume-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="서버가 일시정지됐습니다"
        tabIndex={-1}
      >
        <div className="resume-dialog__head">
          <span className="resume-dialog__icon">
            <PauseIcon />
          </span>
          <h3>서버가 일시정지됐습니다</h3>
          <button type="button" className="resume-dialog__x" aria-label="닫기" onClick={onClose}>
            <CrossIcon size={16} />
          </button>
        </div>

        <div className="resume-dialog__body">
          {done ? (
            <div className="wiz-alert wiz-alert--ok" role="status">
              <span className="wiz-alert__icon">
                <SmallCheckIcon />
              </span>
              <div>
                <b>다시 연결됐습니다</b>
                <p>서버가 켜졌습니다. 이어서 쓸 수 있습니다.</p>
              </div>
            </div>
          ) : requested ? (
            <>
              <p>Supabase 무료 플랜은 7일 동안 쓰지 않으면 서버를 멈춥니다</p>
              <div className="resume-dialog__waiting" role="status">
                <span className="resume-dialog__spin" aria-hidden="true" />
                <div>
                  <b>재개 중…</b>
                  <small>
                    1~2분 걸릴 수 있습니다. 10초마다 다시 확인합니다
                    {resumeChecks > 0 ? ` (${resumeChecks}번째 확인)` : ""}.
                  </small>
                </div>
              </div>
              <p className="resume-dialog__small">이 창을 닫아도 확인은 계속됩니다. 켜지면 띠가 사라집니다.</p>
            </>
          ) : (
            <>
              <p>{RESUME_REASON}</p>
              <button type="button" className="setup-btn resume-dialog__dash" onClick={onDashboard}>
                <ExternalLinkIcon size={14} />
                Supabase 대시보드에서 재개
              </button>
              <div className="resume-dialog__or">또는 앱에서 바로</div>
              <div className="wiz-field">
                <label className="wiz-field__label" htmlFor="resume-pat">
                  Supabase PAT
                </label>
                <div className="resume-dialog__inline">
                  <SecretInput
                    id="resume-pat"
                    value={pat}
                    onChange={setPat}
                    placeholder="sbp_…"
                    state={error ? "bad" : undefined}
                    onEnter={() => void onResumeHere()}
                  />
                  <button
                    type="button"
                    className="setup-btn setup-btn--primary"
                    disabled={!pat.trim() || !ref || busy}
                    onClick={() => void onResumeHere()}
                  >
                    {busy ? "요청 중…" : "여기서 재개"}
                  </button>
                </div>
                <HelpToggle help={FIELD_HELPS.pat} />
              </div>
              {error && (
                <div className="wiz-alert wiz-alert--bad" role="alert">
                  <span className="wiz-alert__icon">
                    <CrossIcon />
                  </span>
                  <div>
                    <b>{error.title}</b>
                    <p>{error.desc}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="resume-dialog__foot">
          <button type="button" className="setup-btn setup-btn--ghost" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}

export default ResumeDialog;
