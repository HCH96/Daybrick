import { LockIcon, ServerIcon, UserIcon, WarnIcon } from "../../../components/icons/ServerIcons";
import { loginFailMessage } from "../../../features/server/messages";
import type { LoginPhase } from "./useWizardLogin";
import GoogleButton from "./GoogleButton";
import "./CenterCard.css";

interface LoginStepProps {
  /** 서버 주소 (https://<ref>.supabase.co) */
  url: string;
  schema: number | null;
  phase: LoginPhase;
  onLogin: () => void;
  onReopenBrowser: () => void;
  onCancelLogin: () => void;
}

function hostOf(url: string): string {
  return url.replace(/^https:\/\//, "");
}

/** 브라우저 로그인을 기다리는 카드 */
function WaitingCard({ onReopenBrowser, onCancelLogin }: Pick<LoginStepProps, "onReopenBrowser" | "onCancelLogin">) {
  return (
    <div className="wiz-center wiz-center--boxed">
      <div className="wiz-big-mark wiz-big-mark--info">
        <span className="wiz-big-mark__spin" />
      </div>
      <h2>브라우저에서 로그인을 마쳐 주세요</h2>
      <p>로그인이 끝나면 자동으로 이 화면으로 돌아옵니다.</p>
      <div className="wiz-center__actions">
        <button type="button" className="setup-btn setup-btn--sm" onClick={onReopenBrowser}>
          브라우저 다시 열기
        </button>
        <button type="button" className="setup-btn setup-btn--ghost setup-btn--sm" onClick={onCancelLogin}>
          취소
        </button>
      </div>
    </div>
  );
}

/** 등록되지 않은 계정 거부 (R53). 어떤 계정이 등록됐는지는 보여주지 않는다. */
function DeniedCard({ onLogin }: Pick<LoginStepProps, "onLogin">) {
  const message = loginFailMessage("login-denied");
  return (
    <div className="wiz-center wiz-center--boxed" role="alert">
      <div className="wiz-big-mark wiz-big-mark--bad">
        <LockIcon size={30} />
      </div>
      <h2>{message.title}</h2>
      <p>{message.desc}</p>
      <GoogleButton small label="다른 계정으로 로그인" onClick={onLogin} />
    </div>
  );
}

/**
 * 로그인 화면 (이미 세팅된 서버, 다른 PC·재설치): [Google로 로그인] → 브라우저 대기 → 성공하면 ④ 완료.
 * 가이드 칸 없이 가운데 정렬 (R6, R51, R53).
 */
function LoginStep({ url, schema, phase, onLogin, onReopenBrowser, onCancelLogin }: LoginStepProps) {
  if (phase.kind === "waiting") {
    return <WaitingCard onReopenBrowser={onReopenBrowser} onCancelLogin={onCancelLogin} />;
  }
  if (phase.kind === "failed" && phase.error === "login-denied") return <DeniedCard onLogin={onLogin} />;

  const failure = phase.kind === "failed" ? loginFailMessage(phase.error) : null;
  return (
    <div className="wiz-center">
      <div className="wiz-big-mark wiz-big-mark--info">
        <UserIcon size={30} />
      </div>
      <h2>이 서버에 로그인하세요</h2>
      <p>
        이미 Daybrick이 세팅된 서버입니다. 처음 세팅할 때 쓴 Google 계정으로 로그인하면 데이터를 그대로 이어서
        씁니다.
      </p>
      <span className="wiz-server-chip">
        <ServerIcon size={14} />
        {hostOf(url)} · 구조 {schema ?? 0}
      </span>
      {failure && (
        <div className="wiz-alert wiz-alert--bad" role="alert">
          <span className="wiz-alert__icon">
            <WarnIcon size={16} />
          </span>
          <div>
            <b>{failure.title}</b>
            <p>{failure.desc}</p>
          </div>
        </div>
      )}
      <GoogleButton onClick={onLogin} />
      <span className="wiz-center__help">
        기본 브라우저에서 Google 로그인 창이 열립니다. 앱은 Google 비밀번호를 받지 않습니다.
      </span>
    </div>
  );
}

export default LoginStep;
