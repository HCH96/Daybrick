import { PAGE_LABELS } from "../../app/pageLabels";
import { useCalendar } from "../../features/calendar/store";
import "./CalendarPage.css";

/**
 * 캘린더 화면 (R1). 지금은 제목과 읽는 중·읽기 실패 안내만 그린다.
 * 월 달력(2단계)·칩(3단계)·입력(5단계)·회고 패널(7단계)은 이어지는 단계에서 채운다.
 */
function CalendarPage() {
  const { state } = useCalendar();

  return (
    <div className="calendar-page">
      <header className="calendar-page__head">
        <h1 className="calendar-page__title">{PAGE_LABELS.calendar}</h1>
      </header>
      {state.kind === "loading" && <div className="calendar-page__notice">불러오는 중…</div>}
      {state.kind === "error" && (
        <div className="calendar-page__notice calendar-page__notice--error">
          저장된 데이터를 읽지 못했어요. 기존 파일을 지키기 위해 저장을 멈췄어요.
          <br />({state.message})
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
