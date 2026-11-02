import { useMemo, useState, type MouseEvent } from "react";
import { usePlan } from "../../../features/plan/store";
import { layoutWeekBars } from "../../../features/plan/weekLayout";
import { addDays, diffDays, toDateKey } from "../../../utils/date";
import BarLayer from "./BarLayer";
import DayHeader from "./DayHeader";
import WeekEmptyHint from "./WeekEmptyHint";
import "./WeekCalendar.css";

interface WeekCalendarProps {
  weekStart: string; // 보고 있는 주의 월요일 "YYYY-MM-DD"
  onOpenTask: (id: string) => void;
}

/**
 * 주간 달력 (R21·R23·R24·R28–R30, D3·D6): 요일 머리 + 7칸 세로줄 배경 위에 태스크 막대 층.
 * 몸통은 막대가 많아지면 세로로 스크롤된다. 지원 일정 층 자리는 7단계에서 막대 층 위에 넣는다.
 */
function WeekCalendar({ weekStart, onOpenTask }: WeekCalendarProps) {
  const { state, addTask } = usePlan();
  const data = state.kind === "ready" ? state.data : null;
  const tasks = useMemo(() => data?.tasks ?? [], [data]);
  const categories = data?.categories ?? [];
  // 더블클릭으로 바로 만들기를 연 날짜 (R28). 다른 주로 가면 보이지 않는다.
  const [draftDay, setDraftDay] = useState<string | null>(null);

  const today = toDateKey(new Date());
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const bars = useMemo(() => layoutWeekBars(tasks, weekStart), [tasks, weekStart]);

  const draftOffset = draftDay ? diffDays(weekStart, draftDay) : -1;
  const draftCol = draftOffset >= 0 && draftOffset < 7 ? draftOffset : null;

  /** 막대·입력칸이 아닌 빈 곳을 더블클릭하면 누른 자리의 날짜에 바로 만들기 칸을 연다 */
  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".plan-tbar, .plan-bars__draft")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.min(6, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * 7)));
    setDraftDay(days[col]);
  };

  const submitDraft = (title: string) => {
    if (!draftDay) return;
    addTask(title, null, { start: draftDay, end: draftDay });
  };

  return (
    <div className="plan-week">
      <DayHeader days={days} today={today} />
      <div className="plan-wk-body">
        <div className="plan-wk-inner" onDoubleClick={handleDoubleClick}>
          <div className="plan-cols" aria-hidden="true">
            {days.map((key) => (
              <i key={key} data-day={key} className={key === today ? "plan-cols__today" : undefined} />
            ))}
          </div>
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
        {bars.length === 0 && draftCol === null && <WeekEmptyHint />}
      </div>
    </div>
  );
}

export default WeekCalendar;
