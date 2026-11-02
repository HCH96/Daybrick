import { useMemo, useState, type MouseEvent } from "react";
import { useApplications } from "../../../features/applications/store";
import { buildWeekSchedule } from "../../../features/plan/applicationEvents";
import { usePlan } from "../../../features/plan/store";
import { formatDropHint } from "../../../features/plan/format";
import { layoutWeekBars } from "../../../features/plan/weekLayout";
import { addDays, diffDays, toDateKey } from "../../../utils/date";
import { usePlanDrag } from "../drag/usePlanDrag";
import BarLayer from "./BarLayer";
import DayHeader from "./DayHeader";
import SchedLayer from "./SchedLayer";
import WeekEmptyHint from "./WeekEmptyHint";
import "./WeekCalendar.css";

interface WeekCalendarProps {
  weekStart: string; // 보고 있는 주의 월요일 "YYYY-MM-DD"
  onOpenTask: (id: string) => void;
  onOpenApplication: (id: string) => void; // 지원 일정 알약 → 지원관리 상세 팝업 (D16)
}

/**
 * 주간 달력 (R21·R23·R24·R28–R30, D3·D6): 요일 머리 + 7칸 세로줄 배경 위에 태스크 막대 층.
 * 몸통은 막대가 많아지면 세로로 스크롤된다. 막대 층 위에는 지원 일정 층(R31–R34)을 둔다:
 * 지원 데이터를 읽기만 하므로 지원관리에서 바꾸면 바로 반영되고, 스위치가 꺼졌거나 지원 데이터가 아직 준비되지 않았으면 층을 그리지 않는다.
 * 끄는 동안(R22·R25·R26) 놓일 칸을 보라로 칠하고 아래에 놓일 날짜 알약을 띄운다. 끝을 끄는 막대는 바뀔 기간으로 바로 다시 그린다.
 */
function WeekCalendar({ weekStart, onOpenTask, onOpenApplication }: WeekCalendarProps) {
  const { state, addTask } = usePlan();
  const data = state.kind === "ready" ? state.data : null;
  const tasks = useMemo(() => data?.tasks ?? [], [data]);
  const categories = data?.categories ?? [];
  const showSchedule = data?.view.showApplicationEvents ?? false;
  const { state: appState } = useApplications();
  const appData = appState.kind === "ready" ? appState.data : null;
  const schedule = useMemo(
    () => (showSchedule && appData ? buildWeekSchedule(appData, weekStart) : null),
    [showSchedule, appData, weekStart],
  );
  const hasSchedule = schedule !== null && schedule.some((pills) => pills.length > 0);
  // 더블클릭으로 바로 만들기를 연 날짜 (R28). 다른 주로 가면 보이지 않는다.
  const [draftDay, setDraftDay] = useState<string | null>(null);

  const today = toDateKey(new Date());
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const { drag } = usePlanDrag();
  const preview = drag?.preview ?? null;
  const resizing = drag !== null && (drag.kind === "bar-start" || drag.kind === "bar-end");

  // 끝을 끄는 중이면 그 태스크만 바뀔 기간으로 바꿔 자리를 다시 잡는다
  const shownTasks = useMemo(() => {
    if (!resizing || !drag || !preview) return tasks;
    return tasks.map((t) => (t.id === drag.taskId ? { ...t, start: preview.start, end: preview.end } : t));
  }, [tasks, resizing, drag, preview]);
  const bars = useMemo(() => layoutWeekBars(shownTasks, weekStart), [shownTasks, weekStart]);

  /** 놓일 칸: 옮기기는 바뀔 기간 전체, 끝 끌기는 포인터 아래 칸 하나 */
  const isDropDay = (key: string): boolean => {
    if (!drag || !preview || preview.start === null || preview.end === null) return false;
    if (resizing) return drag.target?.kind === "day" && drag.target.day === key;
    return key >= preview.start && key <= preview.end;
  };
  const hint =
    drag && preview && preview.start !== null && preview.end !== null
      ? formatDropHint(drag.kind === "bar-start" ? "start" : drag.kind === "bar-end" ? "end" : null, preview.start, preview.end)
      : null;

  const draftOffset = draftDay ? diffDays(weekStart, draftDay) : -1;
  const draftCol = draftOffset >= 0 && draftOffset < 7 ? draftOffset : null;

  /** 막대·입력칸이 아닌 빈 곳을 더블클릭하면 누른 자리의 날짜에 바로 만들기 칸을 연다 */
  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".plan-tbar, .plan-bars__draft, .plan-ev")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.min(6, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * 7)));
    setDraftDay(days[col]);
  };

  const submitDraft = (title: string) => {
    if (!draftDay) return;
    addTask(title, null, { start: draftDay, end: draftDay });
  };

  return (
    <div className="plan-week" data-drop="calendar">
      <DayHeader days={days} today={today} />
      <div className="plan-wk-body">
        <div className="plan-wk-inner" onDoubleClick={handleDoubleClick}>
          <div className="plan-cols" aria-hidden="true">
            {days.map((key) => (
              <i
                key={key}
                data-day={key}
                className={[key === today && "plan-cols__today", isDropDay(key) && "plan-cols__drop"].filter(Boolean).join(" ") || undefined}
              />
            ))}
          </div>
          {schedule && hasSchedule && (
            <SchedLayer week={schedule} dragging={drag !== null} onOpenApplication={onOpenApplication} />
          )}
          <BarLayer
            bars={bars}
            tasks={tasks}
            categories={categories}
            onOpenTask={onOpenTask}
            draftCol={draftCol}
            onSubmitDraft={submitDraft}
            onCloseDraft={() => setDraftDay(null)}
          />
        </div>
        {bars.length === 0 && draftCol === null && !hint && <WeekEmptyHint />}
      </div>
      {hint && <div className="plan-drop-hint">{hint}</div>}
    </div>
  );
}

export default WeekCalendar;
