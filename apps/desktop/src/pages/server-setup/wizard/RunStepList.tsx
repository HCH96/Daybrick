import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { CrossIcon, RefreshIcon, WarnIcon } from "../../../components/icons/ServerIcons";
import { runFailMessage } from "../../../features/server/messages";
import { stepsForFlow, type RunFlow } from "../../../features/server/serverUpdate";
import type { RunProgress, RunStepState } from "../../../features/server/setupRunner";

const STATE_LABEL: Record<RunStepState, string> = {
  wait: "대기",
  run: "진행 중…",
  done: "완료",
  fail: "실패",
};

/** 왼쪽 표시 원: 완료 초록 ✓, 진행 보라 원(돌아감), 대기 회색 빈 원, 실패 빨강 ✕ */
function StepMark({ state }: { state: RunStepState }) {
  switch (state) {
    case "done":
      return <SmallCheckIcon size={14} />;
    case "fail":
      return <CrossIcon size={14} />;
    case "run":
      return <span className="wiz-run__spin" />;
    case "wait":
      return null;
  }
}

interface RunStepListProps {
  progress: RunProgress;
  onRetry: () => void;
  onCancel: () => void;
  /** 어느 단계 목록인지 (기본: ③ 자동 세팅). 서버 업데이트 화면도 이 목록을 쓴다. */
  flow?: RunFlow;
  /** 실패 줄의 [취소] 글자 (서버 업데이트는 [나중에]) */
  cancelLabel?: string;
}

/** ③ 실행·서버 업데이트 단계 목록. 실패한 줄 아래에 이유와 [다시 시도]·[취소] (R15, R17, R23) */
function RunStepList({ progress, onRetry, onCancel, flow = "setup", cancelLabel = "취소" }: RunStepListProps) {
  const { failure } = progress;
  return (
    <ul className="wiz-run">
      {stepsForFlow(flow).map((def, index) => {
        const view = progress.steps[index];
        const message = failure?.index === index ? runFailMessage(failure, flow) : null;
        // 진행 중일 때 따로 보여줄 글이 있으면 (브라우저 로그인 대기)
        const running = view.state === "run" ? def.running : undefined;
        return [
          <li key={def.id} className={`wiz-run__item wiz-run__item--${view.state}`}>
            <span className="wiz-run__mark">
              <StepMark state={view.state} />
            </span>
            <div className="wiz-run__text">
              {def.name}
              <small>{view.detail ?? running?.desc ?? def.desc}</small>
            </div>
            <span className="wiz-run__state">{running?.label ?? STATE_LABEL[view.state]}</span>
          </li>,
          message && (
            <li key={`${def.id}-fail`} className="wiz-run__fail">
              <div className="wiz-alert wiz-alert--bad" role="alert">
                <span className="wiz-alert__icon">
                  <WarnIcon size={16} />
                </span>
                <div>
                  <b>{message.title}</b>
                  <p>{message.desc}</p>
                  <div className="wiz-run__fail-actions">
                    <button type="button" className="setup-btn setup-btn--primary setup-btn--sm" onClick={onRetry}>
                      <RefreshIcon size={14} />
                      다시 시도
                    </button>
                    <button type="button" className="setup-btn setup-btn--ghost setup-btn--sm" onClick={onCancel}>
                      {cancelLabel}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ),
        ];
      })}
    </ul>
  );
}

export default RunStepList;
