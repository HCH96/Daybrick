import { useState } from "react";
import { PAGE_LABELS } from "../../app/pageLabels";
import { useCalendar } from "../../features/calendar/store";
import { useTodayKey } from "../../features/today/useTodayKey";
import { parseDateKey } from "../../utils/date";
import MonthHeader from "./head/MonthHeader";
import MonthGrid, { type FlipDir } from "./grid/MonthGrid";
import "./CalendarPage.css";

interface MonthView {
  year: number;
  month: number; // 0부터 (0 = 1월)
  dir: FlipDir | null; // 이 달로 올 때 넘긴 방향 (처음엔 null)
}

/**
 * 캘린더 화면 (R1–R4, R41). 머리(달 이동·[오늘])와 월 달력을 그린다.
 * 칩(3단계)·입력(5단계)·회고 패널(7단계)은 이어지는 단계에서 채운다. 통계는 넣지 않는다 (R6).
 */
function CalendarPage() {
  const { state } = useCalendar();
  const todayKey = useTodayKey();
  const [view, setView] = useState<MonthView>(() => {
    const today = parseDateKey(todayKey);
    return { year: today.getFullYear(), month: today.getMonth(), dir: null };
  });

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth(), dir: delta > 0 ? "next" : "prev" };
    });

  // [오늘]: 보는 달보다 앞이면 이전 방향, 뒤면 다음 방향. 이미 이번 달이면 그대로
  const goToday = () => {
    const today = parseDateKey(todayKey);
    setView((v) => {
      const diff = today.getFullYear() * 12 + today.getMonth() - (v.year * 12 + v.month);
      if (diff === 0) return v;
      return { year: today.getFullYear(), month: today.getMonth(), dir: diff > 0 ? "next" : "prev" };
    });
  };

  return (
    <div className="calendar-page">
      <header className="calendar-page__head">
        <h1 className="calendar-page__title">{PAGE_LABELS.calendar}</h1>
        <MonthHeader
          year={view.year}
          month={view.month}
          dir={view.dir}
          onPrev={() => shift(-1)}
          onNext={() => shift(1)}
          onToday={goToday}
        />
      </header>
      {state.kind === "loading" && <div className="calendar-page__notice">불러오는 중…</div>}
      {state.kind === "error" && (
        <div className="calendar-page__notice calendar-page__notice--error">
          저장된 데이터를 읽지 못했어요. 기존 파일을 지키기 위해 저장을 멈췄어요.
          <br />({state.message})
        </div>
      )}
      {state.kind === "ready" && (
        <MonthGrid year={view.year} month={view.month} dir={view.dir} todayKey={todayKey} />
      )}
    </div>
  );
}

export default CalendarPage;
