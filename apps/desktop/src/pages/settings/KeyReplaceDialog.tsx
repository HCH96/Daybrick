import { useState } from "react";
import { KeyIcon, WarnIcon } from "../../components/icons/ServerIcons";
import { checkAnthropicKey, setSecrets } from "../../features/server/management";
import { keyReplaceFailMessage, type KeyReplaceFailure } from "../../features/server/messages";
import { checkServerAiKey, recordKeyRegistered } from "../../features/server/serverFunctions";
import type { ServerSession } from "../../features/server/session";
import HelpToggle from "../server-setup/wizard/HelpToggle";
import SecretInput from "../server-setup/wizard/SecretInput";
import { FIELD_HELPS } from "../server-setup/wizard/guides";
import SettingsDialog from "./SettingsDialog";

interface KeyReplaceDialogProps {
  session: ServerSession;
  projectRef: string;
  /** 지금 등록일 ("2026-10-26"), 모르면 null */
  registeredDay: string | null;
  /** 교체를 마쳤을 때 (등록일을 다시 읽도록 접속 확인) */
  onReplaced: () => void;
  onClose: () => void;
}

/**
 * Anthropic 키 교체 (R49): 새 키 확인(R12) → 서버 비밀값 교체 → 등록일 기록(D29) → 서버에서 동작 확인.
 * 키·PAT는 이 창 안에만 두고, 창이 닫히면 사라진다 (R18).
 */
async function replaceKey(session: ServerSession, ref: string, key: string, pat: string): Promise<KeyReplaceFailure | null> {
  const checked = await checkAnthropicKey(key);
  if (!checked.ok) return { step: "anthropic", reason: checked.error };
  const set = await setSecrets(pat, ref, key, "", "");
  if (!set.ok) return { step: "pat", reason: set.error };
  const recorded = await recordKeyRegistered(session, new Date().toISOString());
  if (!recorded.ok) return { step: "record", reason: recorded.error };
  const server = await checkServerAiKey(session.client);
  if (!server.ok) return { step: "server-check", reason: server.error };
  if (!server.value.ok) return { step: "server-check", reason: "key-check-failed" };
  return null;
}

function KeyReplaceDialog({ session, projectRef, registeredDay, onReplaced, onClose }: KeyReplaceDialogProps) {
  const [key, setKey] = useState("");
  const [pat, setPat] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<KeyReplaceFailure | null>(null);
  const ready = key.trim() !== "" && pat.trim() !== "" && !busy;

  const submit = async () => {
    if (!ready) return;
    setBusy(true);
    setFailure(null);
    const result = await replaceKey(session, projectRef, key, pat);
    setBusy(false);
    // 서버의 키가 바뀌었으면 (등록일 기록·서버 확인 실패 포함) 칸을 다시 읽는다
    if (result === null || result.step === "record" || result.step === "server-check") onReplaced();
    if (result === null) onClose();
    else setFailure(result);
  };

  const message = failure ? keyReplaceFailMessage(failure) : null;
  const keyChanged = failure?.step === "record" || failure?.step === "server-check";

  return (
    <SettingsDialog
      title="Anthropic 키 교체"
      icon={<KeyIcon />}
      onClose={busy ? null : onClose}
      footer={
        keyChanged ? (
          <button type="button" className="setup-btn setup-btn--primary" onClick={onClose}>
            닫기
          </button>
        ) : (
          <>
            <button type="button" className="setup-btn setup-btn--ghost" onClick={onClose} disabled={busy}>
              취소
            </button>
            <button
              type="button"
              className="setup-btn setup-btn--primary"
              disabled={!ready}
              onClick={() => void submit()}
            >
              {busy ? "확인 중…" : "확인 후 교체"}
            </button>
          </>
        )
      }
    >
      <p>
        새 키가 동작하는지 먼저 확인한 뒤 서버의 키를 바꿉니다.
        {registeredDay ? ` 지금 등록된 키: ${registeredDay} 등록.` : ""}
      </p>
      {!keyChanged && (
        <>
          <div className="wiz-field">
            <label className="wiz-field__label" htmlFor="key-replace-key">
              새 Anthropic API 키
            </label>
            <SecretInput
              id="key-replace-key"
              value={key}
              onChange={setKey}
              placeholder="sk-ant-…"
              state={failure?.step === "anthropic" ? "bad" : undefined}
              onEnter={() => void submit()}
            />
            <HelpToggle help={FIELD_HELPS.anthropicKey} />
          </div>
          <div className="wiz-field">
            <label className="wiz-field__label" htmlFor="key-replace-pat">
              Supabase PAT
            </label>
            <SecretInput
              id="key-replace-pat"
              value={pat}
              onChange={setPat}
              placeholder="sbp_…"
              state={failure?.step === "pat" ? "bad" : undefined}
              onEnter={() => void submit()}
            />
            <HelpToggle help={FIELD_HELPS.pat} />
          </div>
        </>
      )}
      {message && (
        <div className={`wiz-alert wiz-alert--${message.tone}`} role="alert">
          <span className="wiz-alert__icon">
            <WarnIcon size={16} />
          </span>
          <div>
            <b>{message.title}</b>
            <p>{message.desc}</p>
          </div>
        </div>
      )}
    </SettingsDialog>
  );
}

export default KeyReplaceDialog;
