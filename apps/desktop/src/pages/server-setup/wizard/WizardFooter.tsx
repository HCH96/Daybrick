import { ArrowRightIcon } from "../../../components/icons/ServerIcons";

/** 오른쪽 아래 버튼: 글자·동작·비활성 여부 */
export interface FooterNext {
  label: string;
  onClick: () => void;
  disabled: boolean;
}

interface WizardFooterProps {
  onCancel: () => void;
  /** 실행 중처럼 취소하면 안 될 때 false */
  canCancel?: boolean;
  onPrev: () => void;
  canGoPrev: boolean;
  /** null이면 오른쪽 버튼을 그리지 않는다 (로그인 화면) */
  next: FooterNext | null;
  /** ④ 완료처럼 [취소]·[이전]이 없는 화면 */
  hideBack?: boolean;
}

/** 아래 버튼 줄: [취소]는 왼쪽 끝, [이전]·[다음]은 오른쪽 (R3) */
function WizardFooter({ onCancel, canCancel = true, onPrev, canGoPrev, next, hideBack = false }: WizardFooterProps) {
  return (
    <div className="wiz-foot">
      {!hideBack && (
        <button type="button" className="setup-btn setup-btn--ghost" onClick={onCancel} disabled={!canCancel}>
          취소
        </button>
      )}
      <div className="wiz-foot__spacer" />
      {!hideBack && (
        <button type="button" className="setup-btn" onClick={onPrev} disabled={!canGoPrev}>
          이전
        </button>
      )}
      {next && (
        <button type="button" className="setup-btn setup-btn--primary" onClick={next.onClick} disabled={next.disabled}>
          {next.label}
          <ArrowRightIcon size={15} />
        </button>
      )}
    </div>
  );
}

export default WizardFooter;
