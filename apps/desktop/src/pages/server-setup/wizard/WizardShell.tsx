import { useNavigation } from "../../../app/navigation";
import { ServerIcon } from "../../../components/icons/ServerIcons";
import AppUpdateNotice from "../../../components/server/AppUpdateNotice";
import { ServerUpdatePanel } from "../../../components/server/ServerUpdateScreen";
import { useServer } from "../../../features/server/useServer";
import DoneStep from "./DoneStep";
import { GUIDES } from "./guides";
import KeysStep from "./KeysStep";
import LoginStep from "./LoginStep";
import PrepareStep from "./PrepareStep";
import SetupInputStep from "./SetupInputStep";
import SetupRunStep from "./SetupRunStep";
import { useWizard, type Wizard, type WizardStepId } from "./useWizard";
import WizardFooter, { type FooterNext } from "./WizardFooter";
import WizardGuide from "./WizardGuide";
import WizardProgress from "./WizardProgress";
import "./WizardShell.css";
import "./WizardFields.css";

/** ② 확인 결과가 없어 그릴 수 없는 단계에 잠시 보여주는 자리 */
function PendingStep({ step }: { step: WizardStepId }) {
  return (
    <div className="wiz-form__inner" data-step={step}>
      <p className="wiz-form__desc">이 화면은 주소·키 확인 뒤에 보입니다.</p>
    </div>
  );
}

/**
 * 오른쪽 아래 버튼: 글자·동작·비활성 여부. ②는 확인 전 [확인], 성공하면 [다음] (R4).
 * ③ 실행은 끝나면 스스로 ④로 가므로 버튼은 늘 꺼져 있다. 로그인(·서버 업데이트) 화면은 버튼이 없다.
 * 앱 업데이트 안내는 [닫기]로 마법사를 닫는다 (서버 기능은 쓰지 않음, R24).
 */
function nextButton(wizard: Wizard, onFinish: () => void): FooterNext | null {
  switch (wizard.step) {
    case "prepare":
      return { label: "준비했어요", onClick: wizard.next, disabled: false };
    case "keys": {
      if (wizard.checkingKeys) return { label: "확인 중…", onClick: () => undefined, disabled: true };
      if (wizard.canGoNext) return { label: "다음", onClick: wizard.next, disabled: false };
      const empty = wizard.inputs.url.trim() === "" || wizard.inputs.anonKey.trim() === "";
      return { label: "확인", onClick: () => void wizard.runKeysCheck(), disabled: empty };
    }
    case "setup": {
      if (wizard.setupPhase === "run") {
        const label = wizard.running ? "세팅 중…" : "다음";
        return { label, onClick: () => undefined, disabled: true };
      }
      if (wizard.checkingSetup) return { label: "확인 중…", onClick: () => undefined, disabled: true };
      return { label: "세팅 시작", onClick: () => void wizard.startSetup(), disabled: !wizard.setupFilled };
    }
    case "login":
      return null;
    case "app-update":
      return { label: "닫기", onClick: wizard.cancel, disabled: false };
    case "done":
      return { label: "시작하기", onClick: onFinish, disabled: false };
    default:
      return { label: "다음", onClick: wizard.next, disabled: !wizard.canGoNext };
  }
}

/**
 * 연결 마법사 틀: 위 진행 표시, 왼쪽 단계 화면, 오른쪽 가이드(460px), 아래 버튼 줄.
 * 제목 표시줄 아래 창 전체를 쓰고 사이드바는 없다.
 */
function WizardShell() {
  const { closeSetup, recheck } = useServer();
  const { navigate } = useNavigation();
  const wizard = useWizard(closeSetup);
  const guide = GUIDES[wizard.step];
  // ④ [시작하기]: 마법사를 닫고 홈으로
  const button = nextButton(wizard, () => {
    navigate("home");
    wizard.finish();
  });
  const submit = () => {
    if (button && !button.disabled) button.onClick();
  };

  function renderStep() {
    switch (wizard.step) {
      case "prepare":
        return <PrepareStep />;
      case "keys":
        return (
          <KeysStep
            inputs={wizard.inputs}
            setInputs={wizard.setInputs}
            check={wizard.keysCheck}
            checking={wizard.checkingKeys}
            onSubmit={submit}
          />
        );
      case "setup":
        if (wizard.setupPhase === "run") {
          return (
            <SetupRunStep
              progress={wizard.runProgress}
              onRetry={wizard.retryRun}
              onCancel={wizard.cancel}
              onReopenBrowser={wizard.login.loginUrl ? wizard.login.reopenBrowser : null}
            />
          );
        }
        if (wizard.keysCheck?.kind !== "ok") return <PendingStep step="setup" />;
        return (
          <SetupInputStep
            projectRef={wizard.keysCheck.ref}
            inputs={wizard.inputs}
            setInputs={wizard.setInputs}
            precheck={wizard.setupPrecheck}
            checking={wizard.checkingSetup}
            onSubmit={submit}
            onConfirmNotEmpty={wizard.confirmNotEmpty}
            onDismissNotEmpty={wizard.dismissNotEmpty}
          />
        );
      case "login":
        if (wizard.keysCheck?.kind !== "ok") return <PendingStep step="login" />;
        // login-update 갈래: 로그인 뒤 서버 업데이트 (R23)
        if (wizard.updateSession) {
          return (
            <div className="wiz-form__inner">
              <ServerUpdatePanel
                url={wizard.keysCheck.url}
                anonKey={wizard.keysCheck.anonKey}
                session={wizard.updateSession}
                onLater={wizard.finishUpdate}
                onDone={wizard.finishUpdate}
                onUpdated={recheck}
                onRunningChange={wizard.setUpdateRunning}
                embedded
              />
            </div>
          );
        }
        return (
          <LoginStep
            url={wizard.keysCheck.url}
            schema={wizard.keysCheck.schema}
            phase={wizard.login.phase}
            onLogin={() => void wizard.startLogin()}
            onReopenBrowser={wizard.login.reopenBrowser}
            onCancelLogin={wizard.login.cancelLogin}
          />
        );
      case "app-update":
        if (wizard.keysCheck?.kind !== "ok") return <PendingStep step="app-update" />;
        return (
          <div className="wiz-form__inner">
            <h2>앱을 업데이트하세요</h2>
            <p className="wiz-form__desc">
              이 서버는 이 앱보다 새로운 버전의 서버 구조를 쓰고 있습니다. 앱을 최신 버전으로 바꾼 뒤 다시 연결하세요.
            </p>
            <AppUpdateNotice serverSchema={wizard.keysCheck.schema} appSchema={wizard.keysCheck.appSchema} />
          </div>
        );
      case "done":
        if (!wizard.done) return <PendingStep step="done" />;
        return <DoneStep summary={wizard.done} />;
      default:
        return <PendingStep step={wizard.step} />;
    }
  }

  return (
    <div className="wiz">
      <div className="wiz-top">
        <div className="wiz-top__title">
          <ServerIcon />
          서버 연결
        </div>
        <WizardProgress steps={wizard.steps} current={wizard.stepIndex} />
      </div>

      {/* 가이드가 없는 화면(로그인, 완료)은 가이드 칸 없이 가운데 정렬 */}
      <div className={guide ? "wiz-main" : "wiz-main wiz-main--full"}>
        <div className="wiz-form">{renderStep()}</div>
        {guide && <WizardGuide guide={guide} />}
      </div>

      <WizardFooter
        onCancel={wizard.cancel}
        canCancel={wizard.canCancel}
        onPrev={wizard.prev}
        canGoPrev={wizard.canGoPrev}
        next={button}
        hideBack={wizard.step === "done"}
      />
    </div>
  );
}

export default WizardShell;
