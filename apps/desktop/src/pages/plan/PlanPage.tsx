import { useCallback, useState, type ReactNode } from "react";
import { NAV_LABELS } from "../../app/pageLabels";
import { usePlan } from "../../features/plan/store";
import { addDays, startOfWeek } from "../../utils/date";
import ApplicationDetailModal from "../applications/detail/ApplicationDetailModal";
import WeekCalendar from "./calendar/WeekCalendar";
import TaskDetailModal from "./detail/TaskDetailModal";
import PlanDragProvider from "./drag/PlanDragProvider";
import TaskListPanel from "./list/TaskListPanel";
import WeekNav from "./WeekNav";
import "./PlanPage.css";

/**
 * 플랜 화면: 머리 왼쪽 제목 `Plan`, 오른쪽 기간·주 이동·스위치(WeekNav, D21), 아래 왼쪽 태스크 목록 + 오른쪽 주간 달력 (R1·R2·R4).
 * 보고 있는 주는 화면 안에만 두므로, 다른 메뉴에 갔다 오면 다시 이번 주로 돌아온다 (R3).
 * 목록과 달력 사이 끌어 놓기는 PlanDragProvider가 맡는다 (D12).
 */
function PlanPage() {
  const { state } = usePlan();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  // 상세 팝업으로 연 태스크 (R20·R30). 목록 줄과 달력 막대가 같이 쓴다.
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const closeTask = useCallback(() => setOpenTaskId(null), []);
  // 지원 일정 알약·태스크 팝업의 연결 카드로 연 지원 카드 (R32·R39, D16). 페이지를 옮기지 않고 플랜 위에 띄운다.
  const [openApplicationId, setOpenApplicationId] = useState<string | null>(null);
  const closeApplication = useCallback(() => setOpenApplicationId(null), []);

  return (
    <div className="plan-page">
      <header className="plan-page__head">
        <h1 className="plan-page__title">{NAV_LABELS.plan}</h1>
        <WeekNav
          weekStart={weekStart}
          onPrev={() => setWeekStart((w) => addDays(w, -7))}
          onThisWeek={() => setWeekStart(startOfWeek(new Date()))}
          onNext={() => setWeekStart((w) => addDays(w, 7))}
        />
      </header>
      <PlanDragProvider>
        <div className="plan-page__body">
          <section className="plan-panel" aria-label="태스크 목록">
            <PlanPanelContent state={state.kind} message={state.kind === "error" ? state.message : ""}>
              <TaskListPanel onOpenTask={setOpenTaskId} />
            </PlanPanelContent>
          </section>
          <section className="plan-panel plan-panel--cal" aria-label="주간 달력">
            <PlanPanelContent state={state.kind} message={state.kind === "error" ? state.message : ""}>
              <WeekCalendar weekStart={weekStart} onOpenTask={setOpenTaskId} onOpenApplication={setOpenApplicationId} />
            </PlanPanelContent>
          </section>
        </div>
      </PlanDragProvider>
      {openTaskId && <TaskDetailModal taskId={openTaskId} onClose={closeTask} onOpenApplication={setOpenApplicationId} />}
      {openApplicationId && <ApplicationDetailModal applicationId={openApplicationId} onClose={closeApplication} />}
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
