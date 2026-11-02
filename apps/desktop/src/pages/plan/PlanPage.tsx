import { useState, type ReactNode } from "react";
import { PAGE_LABELS } from "../../app/pageLabels";
import { usePlan } from "../../features/plan/store";
import { addDays, startOfWeek } from "../../utils/date";
import TaskListPanel from "./list/TaskListPanel";
import WeekNav from "./WeekNav";
import "./PlanPage.css";

/**
 * 플랜 화면: 머리 "플랜", 왼쪽 태스크 목록 + 오른쪽 주간 달력 (R1·R2).
 * 보고 있는 주는 화면 안에만 두므로, 다른 메뉴에 갔다 오면 다시 이번 주로 돌아온다 (R3).
 */
function PlanPage() {
  const { state } = usePlan();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  return (
    <div className="plan-page">
      <header className="plan-page__head">
        <h1 className="plan-page__title">{PAGE_LABELS.plan}</h1>
      </header>
      <div className="plan-page__body">
        <section className="plan-panel" aria-label="태스크 목록">
          <PlanPanelContent state={state.kind} message={state.kind === "error" ? state.message : ""}>
            <TaskListPanel />
          </PlanPanelContent>
        </section>
        <section className="plan-panel plan-panel--cal" aria-label="주간 달력">
          <WeekNav
            weekStart={weekStart}
            onPrev={() => setWeekStart((w) => addDays(w, -7))}
            onThisWeek={() => setWeekStart(startOfWeek(new Date()))}
            onNext={() => setWeekStart((w) => addDays(w, 7))}
          />
          <PlanPanelContent state={state.kind} message={state.kind === "error" ? state.message : ""}>
            <div className="plan-week" />
          </PlanPanelContent>
        </section>
      </div>
    </div>
  );
}

interface PlanPanelContentProps {
  state: "loading" | "ready" | "error";
  message: string;
  children: ReactNode;
}

/** 데이터가 준비되면 내용을, 아니면 읽는 중·읽기 실패 문구를 보여준다 (지원 관리 화면과 같은 문구) */
function PlanPanelContent({ state, message, children }: PlanPanelContentProps) {
  if (state === "loading") return <div className="plan-page__notice">불러오는 중…</div>;
  if (state === "error") {
    return (
      <div className="plan-page__notice plan-page__notice--error">
        저장된 데이터를 읽지 못했어요. 기존 파일을 지키기 위해 저장을 멈췄어요.
        <br />({message})
      </div>
    );
  }
  return <>{children}</>;
}

export default PlanPage;
