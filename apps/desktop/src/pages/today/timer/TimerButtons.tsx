import { TimerDoneIcon, TimerPauseIcon, TimerResumeIcon, TimerStopIcon } from "../../../components/icons/TodayIcons";
import { useToday } from "../../../features/today/store";

/** 타이머 버튼 세 개 (R18–R20): 일시정지↔재개(보라) · 완료(초록) · 중단(회색) */
function TimerButtons({ paused }: { paused: boolean }) {
  const { pause, resume, complete, stop } = useToday();
  return (
    <div className="timer-card__btns">
      <button type="button" className="timer-card__btn timer-card__btn--go" onClick={paused ? resume : pause}>
        {paused ? <TimerResumeIcon /> : <TimerPauseIcon />}
        {paused ? "재개" : "일시정지"}
      </button>
      <button type="button" className="timer-card__btn timer-card__btn--done" onClick={complete}>
        <TimerDoneIcon />
        완료
      </button>
      <button type="button" className="timer-card__btn timer-card__btn--stop" onClick={stop}>
        <TimerStopIcon />
        중단
      </button>
    </div>
  );
}

export default TimerButtons;
