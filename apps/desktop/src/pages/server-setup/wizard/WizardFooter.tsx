import { ArrowRightIcon } from "../../../components/icons/ServerIcons";

interface WizardFooterProps {
  onCancel: () => void;
  onPrev: () => void;
  canGoPrev: boolean;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}

/** 아래 버튼 줄: [취소]는 왼쪽 끝, [이전]·[다음]은 오른쪽 (R3) */
function WizardFooter({ onCancel, onPrev, canGoPrev, onNext, nextLabel, nextDisabled = false }: WizardFooterProps) {
  return (
    <div className="wiz-foot">
      <button type="button" className="setup-btn setup-btn--ghost" onClick={onCancel}>
        취소
      </button>
      <div className="wiz-foot__spacer" />
      <button type="button" className="setup-btn" onClick={onPrev} disabled={!canGoPrev}>
        이전
      </button>
      <button type="button" className="setup-btn setup-btn--primary" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
        <ArrowRightIcon size={15} />
      </button>
    </div>
  );
}

export default WizardFooter;
