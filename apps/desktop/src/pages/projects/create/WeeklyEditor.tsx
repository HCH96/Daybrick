import { PlusIcon } from "../../../components/icons/CommonIcons";
import { formatDateRange } from "../../../features/today/format";
import { addDays } from "../../../utils/date";

/** 주 수 범위 */
export const MIN_WEEKS = 1;
export const MAX_WEEKS = 52;
/** 시작 주 고르기 칸: 이번 주 앞뒤로 이만큼 */
const WEEKS_BEFORE = 8;
const WEEKS_AFTER = 26;

interface WeeklyEditorProps {
  /** 이번 주 월요일 "YYYY-MM-DD" (고르기 칸의 기준) */
  thisWeek: string;
  startWeek: string;
  weekCount: number;
  /** 주차 이름 (길이는 weekCount 이상, "" = "N주차") */
  weekNames: string[];
  onStartWeek: (monday: string) => void;
  onWeekCount: (count: number) => void;
  onWeekName: (index: number, name: string) => void;
}

/** "10/26–11/1" (주차 줄의 기간, 목업 .when) */
function shortRange(monday: string): string {
  return formatDateRange(monday, addDays(monday, 6)).replace(" – ", "–");
}

/**
 * 주차형 입력 (프로젝트 R11, 목업 create-weekly): 시작 주(월요일 기준) · 주 수 −/+ · 주차별 기간과 이름 칸.
 * 이름을 비우면 "N주차"로 보인다. 만들기 창과 단계 편집 창(R13)이 같이 쓴다.
 */
function WeeklyEditor({ thisWeek, startWeek, weekCount, weekNames, onStartWeek, onWeekCount, onWeekName }: WeeklyEditorProps) {
  const options: string[] = [];
  for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) options.push(addDays(thisWeek, i * 7));
  // 단계 편집에서는 오래전에 시작한 주도 고른 값으로 보여야 하므로 범위 밖이면 끼워 넣는다 (프로젝트 R13)
  if (!options.includes(startWeek)) {
    options.push(startWeek);
    options.sort();
  }
  const weeks = Array.from({ length: weekCount }, (_, i) => addDays(startWeek, i * 7));

  return (
    <>
      <div className="proj-two">
        <label className="proj-field">
          <span className="proj-field__label">시작 주 (월요일 기준)</span>
          <select className="proj-input proj-select" value={startWeek} onChange={(e) => onStartWeek(e.target.value)}>
            {options.map((monday) => (
              <option key={monday} value={monday}>
                {formatDateRange(monday, addDays(monday, 6))} 주{monday === thisWeek ? " (이번 주)" : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="proj-field">
          <span className="proj-field__label">주 수</span>
          <div className="proj-input proj-stepper">
            <button
              type="button"
              className="proj-icon-btn"
              aria-label="한 주 줄이기"
              disabled={weekCount <= MIN_WEEKS}
              onClick={() => onWeekCount(weekCount - 1)}
            >
              −
            </button>
            <b>{weekCount}</b>
            <button
              type="button"
              className="proj-icon-btn"
              aria-label="한 주 늘리기"
              disabled={weekCount >= MAX_WEEKS}
              onClick={() => onWeekCount(weekCount + 1)}
            >
              <PlusIcon size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="proj-field">
        <span className="proj-field__label">주차 이름 (선택, 비우면 "N주차")</span>
        <div className="proj-steps proj-steps--weeks">
          {weeks.map((monday, i) => (
            <div key={i} className="proj-step">
              <span className="proj-step__no">{i + 1}</span>
              <span className="proj-step__when">{shortRange(monday)}</span>
              <input
                className="proj-input proj-step__input"
                value={weekNames[i] ?? ""}
                placeholder={`${i + 1}주차`}
                aria-label={`${i + 1}주차 이름`}
                onChange={(e) => onWeekName(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default WeeklyEditor;
