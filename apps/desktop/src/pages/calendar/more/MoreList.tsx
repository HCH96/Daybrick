import Popover from "../../../components/common/Popover";
import { SmallCloseIcon } from "../../../components/icons/CommonIcons";
import { itemRange, type CalItem } from "../../../features/calendar/items";
import { parseDateKey } from "../../../utils/date";
import { ItemChip, type CalOpenHandler } from "../chips/CalChip";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface MoreListProps {
  anchor: HTMLElement; // "+N" 글자
  date: Date; // 그날
  items: CalItem[]; // 그날 칩 전부, 칸과 같은 순서 (D13)
  onClose: () => void;
  onOpen: CalOpenHandler;
}

/** "11/3" 모양 */
function shortDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * +N 그날 일정 목록 (목업 part-more, R5). "+N" 아래 왼쪽 맞춤, 너비 250px.
 * 칩은 달력과 같은 컴포넌트를 목록 너비로 그리고, 여러 날 항목은 오른쪽에 기간을 붙인다.
 * 칩을 누르면 목록을 닫고 칸에서 누른 것과 같은 창을 연다 (R19).
 */
function MoreList({ anchor, date, items, onClose, onOpen }: MoreListProps) {
  const open = (item: CalItem) => {
    onClose();
    onOpen(item);
  };

  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-start" width={250} ariaLabel="이 날의 일정" className="cal-day-list">
      <div className="cal-day-list__head">
        {date.getMonth() + 1}월 {date.getDate()}일 ({WEEKDAYS[date.getDay()]})
        <button type="button" className="cal-day-list__close" onClick={onClose} aria-label="닫기">
          <SmallCloseIcon size={14} />
        </button>
      </div>
      {items.map((item) => {
        const { start, end } = itemRange(item);
        return (
          <ItemChip key={item.key} item={item} className="cal-chip cal-chip--list" style={{}} onClick={() => open(item)}>
            {start !== end && (
              <span className="cal-day-list__range">
                {shortDate(start)}–{shortDate(end)}
              </span>
            )}
          </ItemChip>
        );
      })}
    </Popover>
  );
}

export default MoreList;
