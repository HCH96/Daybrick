import type { KeyboardEvent } from "react";
import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import type { KeysCheck } from "../../../features/server/probe";
import CheckResultLine from "./CheckResultLine";
import { FIELD_HELPS } from "./guides";
import HelpToggle from "./HelpToggle";
import type { WizardInputs } from "./useWizard";

interface KeysStepProps {
  inputs: WizardInputs;
  setInputs: (patch: Partial<WizardInputs>) => void;
  check: KeysCheck | null;
  checking: boolean;
  /** 입력칸에서 Enter: [확인] 또는 [다음]과 같다 */
  onSubmit: () => void;
}

type FieldState = "ok" | "bad" | undefined;

/** 결과에 따라 어느 칸 테두리를 초록·빨강으로 할지 */
function fieldStates(check: KeysCheck | null): { url: FieldState; key: FieldState } {
  if (!check) return { url: undefined, key: undefined };
  switch (check.kind) {
    case "ok":
      return { url: "ok", key: "ok" };
    case "bad-url":
      return { url: "bad", key: undefined };
    case "bad-key-format":
    case "secret-key":
    case "bad-key":
      return { url: "ok", key: "bad" };
    default:
      return { url: undefined, key: undefined };
  }
}

function inputClass(state: FieldState) {
  return state ? `wiz-input wiz-input--${state}` : "wiz-input";
}

/** ② Supabase 주소·키: 입력 + "어디서 찾나요?" + 확인 결과 줄 (R4, R5, R8) */
function KeysStep({ inputs, setInputs, check, checking, onSubmit }: KeysStepProps) {
  const states = fieldStates(check);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className="wiz-form__inner">
      <h2>Supabase 주소와 키</h2>
      <p className="wiz-form__desc">
        새로 만든 Supabase 프로젝트의 주소와 공개 키를 붙여넣으세요. 이 두 값은 공개돼도 괜찮은 값이라 이 PC에
        저장됩니다.
      </p>

      <div className="wiz-field">
        <label className="wiz-field__label" htmlFor="wiz-supabase-url">
          Supabase 주소 (Project URL)
        </label>
        <div className={inputClass(states.url)}>
          <input
            id="wiz-supabase-url"
            className="wiz-input__field"
            value={inputs.url}
            placeholder="https://xxxx.supabase.co"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            onChange={(e) => setInputs({ url: e.target.value })}
            onKeyDown={onKeyDown}
          />
          {states.url === "ok" && (
            <span className="wiz-input__ok">
              <SmallCheckIcon size={16} />
            </span>
          )}
        </div>
        <HelpToggle help={FIELD_HELPS.supabaseUrl} />
      </div>

      <div className="wiz-field">
        <label className="wiz-field__label" htmlFor="wiz-supabase-key">
          anon / publishable 키
          <span className="wiz-field__note">eyJ… 또는 sb_publishable_… 둘 다 됩니다</span>
        </label>
        <div className={inputClass(states.key)}>
          <input
            id="wiz-supabase-key"
            className="wiz-input__field"
            value={inputs.anonKey}
            placeholder="sb_publishable_…"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setInputs({ anonKey: e.target.value })}
            onKeyDown={onKeyDown}
          />
        </div>
        <HelpToggle help={FIELD_HELPS.supabaseKey} />
      </div>

      <div className="wiz-result" aria-live="polite">
        {checking && (
          <div className="wiz-alert wiz-alert--checking">
            <div>
              <b>서버에 접속하는 중…</b>
            </div>
          </div>
        )}
        {check && <CheckResultLine check={check} />}
      </div>
    </div>
  );
}

export default KeysStep;
