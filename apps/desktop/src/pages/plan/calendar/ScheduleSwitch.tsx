import { usePlan } from "../../../features/plan/store";

/** 달력 위 줄 오른쪽 `지원 일정` 스위치 (R33). 고른 값은 plan.json에 저장된다 (D10). */
function ScheduleSwitch() {
  const { state, setShowApplicationEvents } = usePlan();
  if (state.kind !== "ready") return null;
  const on = state.data.view.showApplicationEvents;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`plan-switch${on ? " plan-switch--on" : ""}`}
      onClick={() => setShowApplicationEvents(!on)}
    >
      <i aria-hidden="true" />
      지원 일정
    </button>
  );
}

export default ScheduleSwitch;
