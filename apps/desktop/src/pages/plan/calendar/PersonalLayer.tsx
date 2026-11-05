import { useMemo, useState, type CSSProperties } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../components/icons/CommonIcons";
import type { CalItem } from "../../../features/calendar/items";
import { compareSingles, layoutBars } from "../../../features/calendar/monthLayout";
import { addDays } from "../../../utils/date";
import PersonalEditPopover from "../../calendar/personal/PersonalEditPopover";

type PersonalItem = Extract<CalItem, { kind: "personal" }>;

interface PersonalLayerProps {
  items: PersonalItem[]; // 이번 주에 걸린 개인 일정 (buildCalItems의 kind "personal")
  weekStart: string; // 월요일 "YYYY-MM-DD"
}

interface Slot {
  item: PersonalItem;
  col: number;
  span: number;
  row: number;
  cutLeft: boolean;
  cutRight: boolean;
}

/**
 * 한 주의 개인 일정 자리 (R31). 여러 날 막대는 캘린더 `layoutBars`(D8과 같은 줄 규칙)로 위 줄에,
 * 하루짜리는 그날을 지나는 막대 줄 아래로 시간 있는 것(시간순) → 없는 것 순서로 쌓는다. 칸 줄 수 제한(+N)은 없다.
 */
function layoutPersonal(items: PersonalItem[], weekStart: string): Slot[] {
  const weekEnd = addDays(weekStart, 6);
  const bars = layoutBars(items.filter((i) => i.start !== i.end), weekStart, weekEnd);
  const slots: Slot[] = bars.map((b) => ({
    item: b.item as PersonalItem,
    col: b.col,
    span: b.span,
    row: b.lane,
    cutLeft: b.cutLeft,
    cutRight: b.cutRight,
  }));
  const singles = items.filter((i) => i.start === i.end).sort(compareSingles);
  for (let col = 0; col < 7; col++) {
    const day = addDays(weekStart, col);
    const base = bars.filter((b) => b.col <= col && col < b.col + b.span).reduce((m, b) => Math.max(m, b.lane + 1), 0);
    singles
      .filter((i) => i.start === day)
      .forEach((item, i) => slots.push({ item, col, span: 1, row: base + i, cutLeft: false, cutRight: false }));
  }
  return slots;
}

/**
 * 플랜 주간 달력의 개인 일정 층 (R31·R33·R34, D2): 지원 일정 층 아래, 태스크 막대 층 위.
 * 캘린더와 같은 점선 칩·막대이고, 끌 수 없으며 누르면 캘린더의 편집 팝오버를 연다.
 * 팝오버를 연 채 일정이 이번 주에서 빠져도 닫히지 않도록 층은 늘 그리고, 비면 CSS(`:empty`)로 숨긴다.
 */
function PersonalLayer({ items, weekStart }: PersonalLayerProps) {
  const slots = useMemo(() => layoutPersonal(items, weekStart), [items, weekStart]);
  const [open, setOpen] = useState<{ eventId: string; anchor: HTMLElement } | null>(null);

  return (
    <div className="plan-personal">
      {slots.map((s) => {
        const className = ["plan-pev", s.cutLeft && "plan-pev--cut-l", s.cutRight && "plan-pev--cut-r"].filter(Boolean).join(" ");
        const style: CSSProperties = { gridColumn: `${s.col + 1} / span ${s.span}`, gridRow: s.row + 1 };
        return (
          <button
            key={s.item.key}
            type="button"
            className={className}
            style={style}
            title={s.item.title}
            onClick={(e) => setOpen({ eventId: s.item.eventId, anchor: e.currentTarget })}
          >
            {s.cutLeft && (
              <span className="plan-pev__cut" aria-label="지난 주에서 이어짐">
                <ChevronLeftIcon size={12} />
              </span>
            )}
            {s.item.time && <em>{s.item.time}</em>}
            <span className="plan-pev__title">{s.item.title}</span>
            {s.cutRight && (
              <span className="plan-pev__cut plan-pev__cut--r" aria-label="다음 주로 이어짐">
                <ChevronRightIcon size={12} />
              </span>
            )}
          </button>
        );
      })}
      {open && <PersonalEditPopover eventId={open.eventId} anchor={open.anchor} onClose={() => setOpen(null)} />}
    </div>
  );
}

export default PersonalLayer;
