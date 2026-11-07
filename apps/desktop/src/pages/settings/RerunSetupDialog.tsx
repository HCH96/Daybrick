import { useEffect, useState } from "react";
import { SmallCheckIcon } from "../../components/icons/CommonIcons";
import { RefreshIcon } from "../../components/icons/ServerIcons";
import { getAppSchemaVersion } from "../../features/server/management";
import { useRerunSetup } from "../../features/server/rerunSetup";
import type { ServerSession } from "../../features/server/session";
import HelpToggle from "../server-setup/wizard/HelpToggle";
import RunStepList from "../server-setup/wizard/RunStepList";
import SecretInput from "../server-setup/wizard/SecretInput";
import { FIELD_HELPS } from "../server-setup/wizard/guides";
import SettingsDialog from "./SettingsDialog";
import "../server-setup/wizard/SetupRunStep.css";

interface RerunSetupDialogProps {
  session: ServerSession;
  projectRef: string;
  /** 다시 실행을 마쳤을 때 (상태·칸을 다시 읽도록 접속 확인) */
  onFinished: () => void;
  onClose: () => void;
}

/**
 * 자동 세팅 다시 실행 (R49): PAT와 (바꿀 때만) Google 클라이언트 ID·비밀값을 받아
 * ③의 1~4·6단계를 다시 한다. 데이터·로그인 계정은 그대로, 새 가입 막기는 켠 상태 (D12).
 */
function RerunSetupDialog({ session, projectRef, onFinished, onClose }: RerunSetupDialogProps) {
  const [pat, setPat] = useState("");
  const [googleId, setGoogleId] = useState("");
  const [googleSecret, setGoogleSecret] = useState("");
  const [started, setStarted] = useState(false);
  const run = useRerunSetup();

  const halfGoogle = (googleId.trim() === "") !== (googleSecret.trim() === "");
  const ready = pat.trim() !== "" && !halfGoogle;
  const finished = run.outcome === "done";

  // 끝나면 입력값을 버리고 상태를 다시 확인한다
  useEffect(() => {
    if (!finished) return;
    setPat("");
    setGoogleId("");
    setGoogleSecret("");
    onFinished();
  }, [finished, onFinished]);

  const start = async () => {
    if (!ready) return;
    const appSchema = await getAppSchemaVersion();
    setStarted(true);
    run.start({ pat, projectRef, googleClientId: googleId, googleClientSecret: googleSecret, appSchema, session });
  };

  return (
    <SettingsDialog
      title="자동 세팅 다시 실행"
      icon={<RefreshIcon />}
      onClose={run.running ? null : onClose}
      footer={
        started ? (
          <button type="button" className="setup-btn setup-btn--primary" onClick={onClose} disabled={run.running}>
            {finished ? "확인" : "닫기"}
          </button>
        ) : (
          <>
            <button type="button" className="setup-btn setup-btn--ghost" onClick={onClose}>
              취소
            </button>
            <button type="button" className="setup-btn setup-btn--primary" disabled={!ready} onClick={() => void start()}>
              다시 실행
            </button>
          </>
        )
      }
    >
      <p>인증 설정, 서버 구조, 서버 함수, 비밀값을 다시 맞추고 마무리 확인을 합니다. 이미 있는 것은 건너뜁니다.</p>
      <div className="set-dialog__keep">
        <SmallCheckIcon size={16} />
        서버의 데이터는 지워지지 않습니다 · 로그인 계정도 그대로 둡니다
      </div>
      {started ? (
        <>
          <RunStepList progress={run.progress} onRetry={run.retry} onCancel={onClose} flow="rerun" cancelLabel="닫기" />
          {finished && (
            <div className="wiz-alert wiz-alert--ok" role="status">
              <span className="wiz-alert__icon">
                <SmallCheckIcon size={16} />
              </span>
              <div>
                <b>다시 실행을 마쳤습니다</b>
                <p>서버 설정을 다시 맞췄습니다. 데이터는 그대로입니다.</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="wiz-field">
            <label className="wiz-field__label" htmlFor="rerun-pat">
              Supabase PAT
            </label>
            <SecretInput id="rerun-pat" value={pat} onChange={setPat} placeholder="sbp_…" onEnter={() => void start()} />
            <HelpToggle help={FIELD_HELPS.pat} />
          </div>
          <div className="wiz-field">
            <span className="wiz-field__label">
              Google 클라이언트 ID·비밀값 <span className="wiz-field__note">바꿀 때만 입력</span>
            </span>
            <div className="set-dialog__pair">
              <div className="wiz-input">
                <input
                  className="wiz-input__field"
                  value={googleId}
                  placeholder="클라이언트 ID (비워 두면 지금 값 유지)"
                  aria-label="Google 클라이언트 ID"
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setGoogleId(e.target.value)}
                />
              </div>
              <SecretInput
                value={googleSecret}
                onChange={setGoogleSecret}
                placeholder="클라이언트 비밀값 (비워 두면 지금 값 유지)"
                ariaLabel="Google 클라이언트 비밀값"
              />
            </div>
            {halfGoogle && <span className="wiz-field__note">바꾸려면 ID와 비밀값을 둘 다 넣으세요</span>}
          </div>
        </>
      )}
    </SettingsDialog>
  );
}

export default RerunSetupDialog;
