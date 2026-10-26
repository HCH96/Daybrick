import { ServerIcon } from "../../../components/icons/ServerIcons";
import { useServer } from "../../../features/server/useServer";
import { GUIDES } from "./guides";
import PrepareStep from "./PrepareStep";
import { useWizard, type WizardStepId } from "./useWizard";
import WizardFooter from "./WizardFooter";
import WizardGuide from "./WizardGuide";
import WizardProgress from "./WizardProgress";
import "./WizardShell.css";

/** 단계마다 [다음] 버튼 글자 */
const NEXT_LABELS: Record<WizardStepId, string> = {
  prepare: "준비했어요",
  keys: "확인",
  setup: "다음",
  done: "다음",
};

/** 아직 만들지 않은 단계(3단계 이후 구현)에 잠시 보여주는 자리 */
function PendingStep() {
  return (
    <div className="wiz-form__inner">
      <p className="wiz-form__desc">이 단계는 아직 준비 중입니다.</p>
    </div>
  );
}

/**
 * 연결 마법사 틀: 위 진행 표시, 왼쪽 단계 화면, 오른쪽 가이드(460px), 아래 버튼 줄.
 * 제목 표시줄 아래 창 전체를 쓰고 사이드바는 없다.
 */
function WizardShell() {
  const { closeSetup } = useServer();
  const wizard = useWizard(closeSetup);
  const guide = GUIDES[wizard.step];

  return (
    <div className="wiz">
      <div className="wiz-top">
        <div className="wiz-top__title">
          <ServerIcon />
          서버 연결
        </div>
        <WizardProgress current={wizard.stepIndex} />
      </div>

      <div className="wiz-main">
        <div className="wiz-form">{wizard.step === "prepare" ? <PrepareStep /> : <PendingStep />}</div>
        {guide ? <WizardGuide guide={guide} /> : <aside className="wiz-guide" />}
      </div>

      <WizardFooter
        onCancel={wizard.cancel}
        onPrev={wizard.prev}
        canGoPrev={wizard.canGoPrev}
        onNext={wizard.next}
        nextLabel={NEXT_LABELS[wizard.step]}
        nextDisabled={wizard.step !== "prepare"}
      />
    </div>
  );
}

export default WizardShell;
