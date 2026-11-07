import type { KeyboardEvent } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { KeyIcon, LockIcon } from "../../../components/icons/ServerIcons";
import type { SetupPrecheck } from "../../../features/server/management";
import { notEmptyConfirm, setupPrecheckMessage } from "../../../features/server/messages";
import { FIELD_HELPS } from "./guides";
import HelpToggle from "./HelpToggle";
import RedirectUrlRow from "./RedirectUrlRow";
import SecretInput from "./SecretInput";
import type { WizardInputs } from "./useWizard";
import "./SetupInputStep.css";

interface SetupInputStepProps {
  projectRef: string;
  inputs: WizardInputs;
  setInputs: (patch: Partial<WizardInputs>) => void;
  precheck: SetupPrecheck | null;
  checking: boolean;
  /** 입력칸에서 Enter: [세팅 시작]과 같다 */
  onSubmit: () => void;
  onConfirmNotEmpty: () => void;
  onDismissNotEmpty: () => void;
}

/** 사전 확인이 실패한 칸을 빨강으로 */
function badField(precheck: SetupPrecheck | null): "anthropicKey" | "pat" | null {
  if (precheck?.kind === "anthropic-failed") return "anthropicKey";
  if (precheck?.kind === "pat-failed" || precheck?.kind === "inspect-failed") return "pat";
  return null;
}

/** ③ 자동 세팅 입력: PAT·Anthropic 키, 리디렉션 주소, Google 클라이언트 ID·비밀값 + 사전 확인 결과 (R11–R14, R54) */
function SetupInputStep(props: SetupInputStepProps) {
  const { projectRef, inputs, setInputs, precheck, checking, onSubmit } = props;
  const bad = badField(precheck);
  const message = precheck ? setupPrecheckMessage(precheck, projectRef) : null;
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className="wiz-form__inner">
      <h2>자동 세팅</h2>
      <p className="wiz-form__desc">
        앱이 서버에 테이블·로그인 설정·서버 함수를 만들어 줍니다. 아래 값은 세팅하는 동안에만 쓰고 저장하지 않습니다.
      </p>

      <div className="wiz-section-label">Supabase · Anthropic</div>
      <div className="wiz-field">
        <label className="wiz-field__label" htmlFor="wiz-pat">
          Supabase 개인 액세스 토큰 (PAT)
        </label>
        <SecretInput
          id="wiz-pat"
          value={inputs.pat}
          onChange={(pat) => setInputs({ pat })}
          placeholder="sbp_…"
          state={bad === "pat" ? "bad" : undefined}
          onEnter={onSubmit}
        />
        <HelpToggle help={FIELD_HELPS.pat} />
      </div>
      <div className="wiz-field">
        <label className="wiz-field__label" htmlFor="wiz-anthropic-key">
          Anthropic API 키
        </label>
        <SecretInput
          id="wiz-anthropic-key"
          value={inputs.anthropicKey}
          onChange={(anthropicKey) => setInputs({ anthropicKey })}
          placeholder="sk-ant-…"
          state={bad === "anthropicKey" ? "bad" : undefined}
          onEnter={onSubmit}
        />
        <HelpToggle help={FIELD_HELPS.anthropicKey} />
      </div>

      <div className="wiz-section-label">Google 로그인</div>
      <RedirectUrlRow projectRef={projectRef} />
      <div className="wiz-two-col">
        <div className="wiz-field">
          <label className="wiz-field__label" htmlFor="wiz-google-id">
            클라이언트 ID
          </label>
          <div className="wiz-input">
            <input
              id="wiz-google-id"
              className="wiz-input__field"
              value={inputs.googleClientId}
              placeholder="….apps.googleusercontent.com"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setInputs({ googleClientId: e.target.value })}
              onKeyDown={onKeyDown}
            />
          </div>
          <HelpToggle help={FIELD_HELPS.googleClientId} />
        </div>
        <div className="wiz-field">
          <label className="wiz-field__label" htmlFor="wiz-google-secret">
            클라이언트 보안 비밀번호
          </label>
          <SecretInput
            id="wiz-google-secret"
            value={inputs.googleClientSecret}
            onChange={(googleClientSecret) => setInputs({ googleClientSecret })}
            placeholder="GOCSPX-…"
            onEnter={onSubmit}
          />
          <HelpToggle help={FIELD_HELPS.googleClientSecret} />
        </div>
      </div>

      <div className="wiz-result" aria-live="polite">
        {checking && (
          <div className="wiz-alert wiz-alert--checking">
            <div>
              <b>키와 PAT를 확인하는 중…</b>
            </div>
          </div>
        )}
        {message && (
          <div className={`wiz-alert wiz-alert--${message.tone}`} role="alert">
            <span className="wiz-alert__icon">{bad === "anthropicKey" ? <KeyIcon /> : <LockIcon />}</span>
            <div>
              <b>{message.title}</b>
              <p>{message.desc}</p>
            </div>
          </div>
        )}
      </div>

      {precheck?.kind === "not-empty" && (
        <ConfirmDialog
          {...notEmptyConfirm(precheck.otherTables)}
          onConfirm={props.onConfirmNotEmpty}
          onCancel={props.onDismissNotEmpty}
        />
      )}
    </div>
  );
}

export default SetupInputStep;
