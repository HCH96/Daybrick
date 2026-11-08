import { TimerDoneIcon, TimerPauseIcon, TimerResumeIcon, TimerStopIcon } from "../../../components/icons/TodayIcons";
import { useToday } from "../../../features/today/store";

/**
 * 타이머 버튼 세 개 (R18–R20): 일시정지↔재개(보라) · 완료(초록) · 중단(회색).
 * 카드가 좁으면 글자를 숨기고 아이콘만 남긴다 (TimerCard.css), 이름은 aria-label이 맡는다.
 */
function TimerButtons({ paused }: { paused: boolean }) {
  const { pause, resume, complete, stop } = useToday();
  const goLabel = paused ? "재개" : "일시정지";
  return (
    <div className="timer-card__btns">
      <button
        type="button"
        className="timer-card__btn timer-card__btn--go"
        aria-label={goLabel}
        title={goLabel}
        onClick={paused ? resume : pause}
      >
        {paused ? <TimerResumeIcon /> : <TimerPauseIcon />}
        <span className="timer-card__btn-label">{goLabel}</span>
      </button>
      <button type="button" className="timer-card__btn timer-card__btn--done" aria-label="완료" title="완료" onClick={complete}>
        <TimerDoneIcon />
        <span className="timer-card__btn-label">완료</span>
      </button>
      <button type="button" className="timer-card__btn timer-card__btn--stop" aria-label="중단" title="중단" onClick={stop}>
        <TimerStopIcon />
        <span className="timer-card__btn-label">중단</span>
      </button>
    </div>
  );
}

export default TimerButtons;
