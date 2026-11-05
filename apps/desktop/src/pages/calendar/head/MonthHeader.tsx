import { ChevronLeftIcon, ChevronRightIcon } from "../../../components/icons/CommonIcons";
import type { FlipDir } from "../grid/MonthGrid";

interface MonthHeaderProps {
  year: number;
  month: number; // 0부터 (0 = 1월)
  dir: FlipDir | null; // 마지막으로 넘긴 방향. 글자도 같은 방향으로 바뀐다 (R41)
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

/**
 * 페이지 머리 오른쪽 (목업 cal-head, R3): [<] 2026년 11월 [>] [오늘]. D-day는 넣지 않는다.
 */
function MonthHeader({ year, month, dir, onPrev, onNext, onToday }: MonthHeaderProps) {
  const label = `${year}년 ${month + 1}월`;
  return (
    <div className="cal-month-nav">
      <button type="button" className="cal-icon-btn" onClick={onPrev} aria-label="이전 달">
        <ChevronLeftIcon size={16} />
      </button>
      <span className="cal-month-nav__title">
        {/* key가 바뀌면 다시 그려져 애니메이션이 처음부터 돈다 */}
        <span key={label} className={dir ? `cal-flip-text cal-flip-text--${dir}` : undefined}>
          {label}
        </span>
      </span>
      <button type="button" className="cal-icon-btn" onClick={onNext} aria-label="다음 달">
        <ChevronRightIcon size={16} />
      </button>
      <button type="button" className="cal-btn" onClick={onToday}>
        오늘
      </button>
    </div>
  );
}

export default MonthHeader;
