import { ServerIcon } from "../../../components/icons/ServerIcons";
import { useServer } from "../../../features/server/useServer";
import { GUIDES } from "./guides";
import KeysStep from "./KeysStep";
import PrepareStep from "./PrepareStep";
import { useWizard, type Wizard, type WizardStepId } from "./useWizard";
import WizardFooter from "./WizardFooter";
import WizardGuide from "./WizardGuide";
import WizardProgress from "./WizardProgress";
import "./WizardShell.css";
import "./WizardFields.css";

/** 아직 만들지 않은 단계에 잠시 보여주는 자리 (해당 화면은 뒤 단계에서 연결) */
const PENDING_TEXT: Partial<Record<WizardStepId, string>> = {
  setup: "③ 자동 세팅 화면은 다음 단계에서 연결합니다.",
  login: "로그인 화면은 다음 단계에서 연결합니다.",
  "app-update": "앱 업데이트 안내 화면은 다음 단계에서 연결합니다.",
  done: "완료 화면은 다음 단계에서 연결합니다.",
};

function PendingStep({ step }: { step: WizardStepId }) {
  return (
    <div className="wiz-form__inner">
      <p className="wiz-form__desc">{PENDING_TEXT[step] ?? "이 화면은 다음 단계에서 연결합니다."}</p>
    </div>
  );
}

/** 오른쪽 아래 버튼: 글자·동작·비활성 여부. ②는 확인 전 [확인], 성공하면 [다음] (R4) */
function nextButton(wizard: Wizard): { label: string; onClick: () => void; disabled: boolean } {
  switch (wizard.step) {
    case "prepare":
      return { label: "준비했어요", onClick: wizard.next, disabled: false };
    case "keys": {
      if (wizard.checkingKeys) return { label: "확인 중…", onClick: () => undefined, disabled: true };
      if (wizard.canGoNext) return { label: "다음", onClick: wizard.next, disabled: false };
      const empty = wizard.inputs.url.trim() === "" || wizard.inputs.anonKey.trim() === "";
      return { label: "확인", onClick: () => void wizard.runKeysCheck(), disabled: empty };
    }
    default:
      return { label: "다음", onClick: wizard.next, disabled: !wizard.canGoNext };
  }
}

/**
 * 연결 마법사 틀: 위 진행 표시, 왼쪽 단계 화면, 오른쪽 가이드(460px), 아래 버튼 줄.
 * 제목 표시줄 아래 창 전체를 쓰고 사이드바는 없다.
 */
function WizardShell() {
  const { closeSetup } = useServer();
  const wizard = useWizard(closeSetup);
  const guide = GUIDES[wizard.step];
  const button = nextButton(wizard);

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
            onSubmit={() => {
              if (!button.disabled) button.onClick();
            }}
          />
        );
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

      <div className="wiz-main">
        <div className="wiz-form">{renderStep()}</div>
        {guide ? <WizardGuide guide={guide} /> : <aside className="wiz-guide" />}
      </div>

      <WizardFooter
        onCancel={wizard.cancel}
        onPrev={wizard.prev}
        canGoPrev={wizard.canGoPrev}
        onNext={button.onClick}
        nextLabel={button.label}
        nextDisabled={button.disabled}
      />
    </div>
  );
}

export default WizardShell;
