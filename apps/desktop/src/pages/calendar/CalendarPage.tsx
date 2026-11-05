import { useCallback, useState } from "react";
import { useNavigation } from "../../app/navigation";
import { PAGE_LABELS } from "../../app/pageLabels";
import type { CalItem } from "../../features/calendar/items";
import { useCalendar } from "../../features/calendar/store";
import { useTodayKey } from "../../features/today/useTodayKey";
import { parseDateKey } from "../../utils/date";
import ApplicationDetailModal from "../applications/detail/ApplicationDetailModal";
import TaskDetailModal from "../plan/detail/TaskDetailModal";
import PersonalEditPopover from "./personal/PersonalEditPopover";
import MonthHeader from "./head/MonthHeader";
import MonthGrid, { type FlipDir } from "./grid/MonthGrid";
import ReviewPanel from "./review/ReviewPanel";
import "./CalendarPage.css";

interface MonthView {
  year: number;
  month: number; // 0부터 (0 = 1월)
  dir: FlipDir | null; // 이 달로 올 때 넘긴 방향 (처음엔 null)
}

/**
 * 캘린더 화면 (R1–R4, R41). 머리(달 이동·[오늘])와 월 달력을 그린다.
 * 칩을 누르면 종류별로 플랜 상세·지원 상세 팝업을 열거나 프로젝트 상세로 간다 (R19).
 * 개인 일정 칩은 편집 팝오버를 연다 (R28). 빈 곳 입력은 MonthGrid가 맡는다 (R23·R24).
 * 지난 칸 빈 곳을 누르면 오른쪽에 회고 패널이 붙고 달력은 좁아진다 (R42–R48). 통계는 넣지 않는다 (R6).
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

  // 칩 누르기 (R19): 태스크 → 플랜 상세, 지원 → 지원 상세, 깃발 → 프로젝트 상세 화면.
  // 개인 일정 → 누른 칩 옆에 편집 팝오버 (R28)
  const { navigate } = useNavigation();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const closeTask = useCallback(() => setOpenTaskId(null), []);
  const [openApplicationId, setOpenApplicationId] = useState<string | null>(null);
  const closeApplication = useCallback(() => setOpenApplicationId(null), []);
  const [editing, setEditing] = useState<{ eventId: string; anchor: HTMLElement } | null>(null);
  const closeEditing = useCallback(() => setEditing(null), []);
  const openItem = useCallback(
    (item: CalItem, anchor: HTMLElement) => {
      if (item.kind === "task") setOpenTaskId(item.taskId);
      else if (item.kind === "app") setOpenApplicationId(item.applicationId);
      else if (item.kind === "flag") navigate("projects", item.projectId);
      else setEditing({ eventId: item.eventId, anchor });
    },
    [navigate],
  );

  // 회고 패널 (R42–R48): 지난 칸 빈 곳을 누른 날. 다른 지난 칸을 누르면 그 날로 바뀐다
  const [reviewDay, setReviewDay] = useState<string | null>(null);
  const closeReview = useCallback(() => setReviewDay(null), []);

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
        <div className={reviewDay ? "calendar-page__row calendar-page__row--review" : "calendar-page__row"}>
          <MonthGrid
            year={view.year}
            month={view.month}
            dir={view.dir}
            todayKey={todayKey}
            onOpen={openItem}
            reviewDay={reviewDay}
            onReview={setReviewDay}
          />
          {reviewDay && <ReviewPanel day={reviewDay} onClose={closeReview} onOpen={openItem} />}
        </div>
      )}
      {openTaskId && <TaskDetailModal taskId={openTaskId} onClose={closeTask} onOpenApplication={setOpenApplicationId} />}
      {openApplicationId && <ApplicationDetailModal applicationId={openApplicationId} onClose={closeApplication} />}
      {editing && <PersonalEditPopover eventId={editing.eventId} anchor={editing.anchor} onClose={closeEditing} />}
    </div>
  );
}

export default CalendarPage;
