import { RUN_STEPS, type RunProgress } from "../../../features/server/setupRunner";
import RunStepList from "./RunStepList";
import "./SetupRunStep.css";

interface SetupRunStepProps {
  progress: RunProgress;
  onRetry: () => void;
  onCancel: () => void;
  /** 계정 등록에서 브라우저 로그인을 기다리는 중이면 [브라우저 다시 열기] */
  onReopenBrowser: (() => void) | null;
}

/** ③ 자동 세팅 실행 화면: 제목, 진행 막대 "n / 6 단계", 단계 목록 (R15, R17) */
function SetupRunStep({ progress, onRetry, onCancel, onReopenBrowser }: SetupRunStepProps) {
  const total = RUN_STEPS.length;
  const doneCount = progress.steps.filter((step) => step.state === "done").length;
  // 지금 하는(또는 멈춘) 단계 번호. 모두 끝났으면 마지막 번호.
  const current = Math.min(doneCount + 1, total);

  return (
    <div className="wiz-form__inner">
      <h2>서버를 세팅하는 중입니다</h2>
      <p className="wiz-form__desc">
        창을 닫지 마세요. 중간에 멈춰도 다시 시도하면 멈춘 단계부터 이어서 합니다.
      </p>
      <div className="wiz-run-progress__label">
        <span>
          {current} / {total} 단계
        </span>
      </div>
      <div className="wiz-run-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneCount}>
        <i style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>

      <RunStepList progress={progress} onRetry={onRetry} onCancel={onCancel} />

      {onReopenBrowser && (
        <div className="wiz-run__reopen">
          <button type="button" className="setup-btn setup-btn--sm" onClick={onReopenBrowser}>
            브라우저 다시 열기
          </button>
          <span>브라우저 창이 안 보이면 눌러 주세요</span>
        </div>
      )}
    </div>
  );
}

export default SetupRunStep;
