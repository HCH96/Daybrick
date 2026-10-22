import { useState } from "react";
import Popover from "../../../components/common/Popover";
import { findPropertyByRole } from "../../../features/applications/properties";
import { useApplications } from "../../../features/applications/store";
import { isSameStatus } from "../../../features/applications/transitions";
import type { Application, PropertyDef, StageId, StatusId } from "../../../features/applications/types";
import ScheduleButton from "../schedule/ScheduleButton";
import ResultPicker from "../status/ResultPicker";
import StageDatePicker from "../status/StageDatePicker";
import StatusBadge from "../status/StatusBadge";
import StatusPicker from "../status/StatusPicker";
import "../status/StatusPicker.css";

interface StatusRowProps {
  application: Application;
  properties: readonly PropertyDef[];
}

/** 배지 아래에 지금 떠 있는 창: 상태 고르기 → (종료면) 결과 고르기 / (전형 준비면) 날짜 고르기 */
type OpenStep = { kind: "status" } | { kind: "result" } | { kind: "stage-date"; stage: StageId } | null;

/** 제목 아래 상태 줄: 큰 상태 배지를 누르면 상태를 고른다 (R17~R22). 옆의 📅 버튼은 전형 일정 창 (R24~R27). */
function StatusRow({ application, properties }: StatusRowProps) {
  const { changeStatus, addStageEvent, setValue } = useApplications();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [step, setStep] = useState<OpenStep>(null);

  // 결과 속성을 지웠으면 결과 고르기 칸을 띄우지 않는다 (D4)
  const resultProperty = findPropertyByRole(properties, "result");
  const resultUsable = resultProperty !== null && resultProperty.type === "select";
  const resultValue = resultProperty ? application.values[resultProperty.id] : null;

  const pick = (status: StatusId, stage: StageId | null) => {
    if (isSameStatus(application, status, stage)) {
      setStep(null);
      return;
    }
    changeStatus(application.id, status, stage);
    if (status === "closed" && resultUsable) setStep({ kind: "result" });
    else if (status === "stage-prep" && stage) setStep({ kind: "stage-date", stage });
    else setStep(null);
  };

  const close = () => setStep(null);

  return (
    <div className="detail-modal__status">
      <button
        ref={setAnchor}
        type="button"
        className="status-row__badge"
        aria-label="상태 바꾸기"
        aria-haspopup="menu"
        aria-expanded={step?.kind === "status"}
        onClick={() => setStep((s) => (s?.kind === "status" ? null : { kind: "status" }))}
      >
        <StatusBadge status={application.status} stage={application.stage} size="big" chevron />
      </button>
      <ScheduleButton application={application} />

      {step && anchor && step.kind === "status" && (
        <Popover anchor={anchor} onClose={close} width={170} ariaLabel="상태 고르기">
          <StatusPicker status={application.status} stage={application.stage} onPick={pick} />
        </Popover>
      )}

      {step && anchor && step.kind === "result" && resultUsable && resultProperty && (
        <Popover anchor={anchor} onClose={close} width={260} ariaLabel="결과 고르기">
          <ResultPicker
            property={resultProperty}
            value={typeof resultValue === "string" ? resultValue : null}
            onPick={(optionId) => {
              setValue(application.id, resultProperty.id, optionId);
              close();
            }}
            onLater={close}
          />
        </Popover>
      )}

      {step && anchor && step.kind === "stage-date" && (
        <Popover anchor={anchor} onClose={close} width={252} ariaLabel="전형 날짜 고르기">
          <StageDatePicker
            stage={step.stage}
            onPick={(date) => {
              addStageEvent(application.id, step.stage, date);
              close();
            }}
            onSkip={close}
          />
        </Popover>
      )}
    </div>
  );
}

export default StatusRow;
