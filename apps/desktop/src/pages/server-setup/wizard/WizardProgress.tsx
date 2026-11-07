import { Fragment } from "react";
import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import type { WizardStepInfo } from "./useWizard";

/** 위 진행 표시: 지난 단계 초록 ✓, 지금 단계 보라, 남은 단계 회색 (R3). 셋째 칸 이름은 갈래에 따라 바뀐다. */
function WizardProgress({ steps, current }: { steps: readonly WizardStepInfo[]; current: number }) {
  return (
    <ol className="wiz-steps" aria-label="진행 단계">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "on" : "wait";
        return (
          <Fragment key={step.id}>
            {i > 0 && (
              <li
                className={i <= current ? "wiz-steps__line wiz-steps__line--done" : "wiz-steps__line"}
                aria-hidden="true"
              />
            )}
            <li
              className={`wiz-steps__step wiz-steps__step--${state}`}
              aria-current={state === "on" ? "step" : undefined}
            >
              <span className="wiz-steps__num">{state === "done" ? <SmallCheckIcon size={16} /> : i + 1}</span>
              {step.label}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

export default WizardProgress;
