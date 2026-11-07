import { useMemo, useState, type AnimationEvent } from "react";
import { useApplications } from "../../../features/applications/store";
import { useCalendar } from "../../../features/calendar/store";
import { buildCalItems } from "../../../features/calendar/items";
import { layoutWeek } from "../../../features/calendar/monthLayout";
import { usePlan } from "../../../features/plan/store";
import type { PersonalEvent } from "../../../features/calendar/types";
import { getMonthGrid } from "../../../utils/calendarGrid";
import type { CalOpenHandler } from "../chips/CalChip";
import DragGhost from "../drag/DragGhost";
import { useCalendarDrag, type ChipDrag } from "../drag/useCalendarDrag";
import { useRangeSelect, type DaySelection } from "./useRangeSelect";
import WeekRow, { type PersonalDraft } from "./WeekRow";
import "./Grid.css";

/** 달을 넘긴 방향. next = 다음 달(왼쪽으로 밀림), prev = 이전 달(오른쪽으로 밀림) */
export type FlipDir = "next" | "prev";

const DOW = ["월", "화", "수", "목", "금", "토", "일"];

interface MonthGridProps {
  year: number;
  month: number; // 0부터 (0 = 1월)
  dir: FlipDir | null; // 마지막으로 넘긴 방향. null이면 처음 그린 것이라 움직이지 않는다
  todayKey: string;
  onOpen: CalOpenHandler; // 칩을 눌렀을 때 (R19)
  reviewDay: string | null; // 회고 패널로 고른 지난 날 (회색 테두리, R42)
  onReview: (day: string) => void; // 지난 칸 빈 곳을 눌렀을 때 (R42·R48, D5)
}

/** 년·월을 하나의 수로 (비교·key용) */
function monthIndex(year: number, month: number): number {
  return year * 12 + month;
}

/**
 * 월 달력 (목업 cal-grid, R2·R4) + 달 넘김 (part-flip, R41).
 * 요일 머리줄은 고정이고, 주 줄 묶음(page)만 넘어간다. 넘길 때 앞 달 page를 잠깐 겹쳐 그려
 * 밀려나게 하고, 새 달 page는 key가 바뀌어 다시 그려지며 들어온다.
 * 애니메이션 중에 또 넘기면 밀려나던 page를 버리고 바로 새 달로 간다 (쌓이지 않음).
 * 빈 곳 누르기(오늘·미래) → 하루짜리 입력칸, 드래그 → 기간 입력칸 (R23·R24, D5·D10).
 * 칩 드래그 → 태스크·개인 일정을 다른 날로 옮긴다 (R35–R40). 끌기 시작하면 입력칸을 닫는다.
 */
function MonthGrid({ year, month, dir, todayKey, onOpen, reviewDay, onReview }: MonthGridProps) {
  const current = monthIndex(year, month);
  const [shown, setShown] = useState(current);
  const [leaving, setLeaving] = useState<{ index: number; dir: FlipDir } | null>(null);
  const { addEvent } = useCalendar();
  const [draft, setDraft] = useState<PersonalDraft | null>(null);

  // 지난 날 누르기 → 회고 패널 (D5). 패널이 열린 채 오늘·미래를 누르면 패널은 두고 입력칸
  const { selecting, onMouseDown } = useRangeSelect({
    onClick: (day) => {
      if (day >= todayKey) {
        setDraft({ kind: "quick", start: day, end: day });
      } else {
        setDraft(null);
        onReview(day);
      }
    },
    onRange: (range) => setDraft({ kind: "range", ...range }),
  });
  const { drag, ghostRef, chipDrag } = useCalendarDrag({ onStart: () => setDraft(null) });

  // 그리는 중에 달이 바뀐 것을 알아채 밀려날 page를 정한다 (React의 "props에서 상태 끌어내기" 방식)
  if (shown !== current) {
    setLeaving(dir && leaving === null ? { index: shown, dir } : null);
    setShown(current);
  }

  const onLeaveEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setLeaving(null);
  };

  const submitDraft = (title: string) => {
    if (draft) addEvent(title, draft.start, draft.end);
    setDraft(null);
  };
  const cancelDraft = () => setDraft(null);
  const selection: DaySelection | null = selecting ?? (draft?.kind === "range" ? draft : null);

  return (
    <div className="cal-grid">
      <div className="cal-dow">
        {DOW.map((d, i) => (
          <span key={d} className={i === 5 ? "cal-dow__sat" : i === 6 ? "cal-dow__sun" : undefined}>
            {d}
          </span>
        ))}
      </div>
      <div className="cal-pages" onMouseDown={onMouseDown}>
        {leaving && (
          <MonthPage
            key={`out-${leaving.index}`}
            index={leaving.index}
            todayKey={todayKey}
            onOpen={onOpen}
            className={`cal-page cal-page--out-${leaving.dir}`}
            onAnimationEnd={onLeaveEnd}
          />
        )}
        <MonthPage
          key={current}
          index={current}
          todayKey={todayKey}
          onOpen={onOpen}
          className={dir ? `cal-page cal-page--in-${dir}` : "cal-page"}
          selection={selection}
          draft={draft}
          onDraftSubmit={submitDraft}
          onDraftCancel={cancelDraft}
          chipDrag={chipDrag}
          drop={drag?.drop ?? null}
          reviewDay={reviewDay}
        />
      </div>
      {drag && <DragGhost drag={drag} ghostRef={ghostRef} />}
    </div>
  );
}

const NO_EVENTS: PersonalEvent[] = [];
const noop = () => {};

interface MonthPageProps {
  index: number; // monthIndex
  todayKey: string;
  onOpen: CalOpenHandler; // 칩을 눌렀을 때 (R19)
  className: string;
  onAnimationEnd?: (e: AnimationEvent<HTMLDivElement>) => void;
  selection?: DaySelection | null; // 보라로 묶을 범위 (밀려나는 page에는 없음)
  draft?: PersonalDraft | null; // 입력 중인 새 개인 일정
  onDraftSubmit?: (title: string) => void;
  onDraftCancel?: () => void;
  chipDrag?: ChipDrag; // 칩 옮기기 (밀려나는 page에는 없음)
  drop?: DaySelection | null; // 끄는 칩이 놓일 기간
  reviewDay?: string | null; // 회고 패널로 고른 지난 날
}

/**
 * 한 달의 주 줄 5~6개 묶음. 보이는 기간(그리드 첫날~끝날)의 칩을 모아 주마다 자리를 계산한다.
 * 플랜·지원관리·캘린더 저장소를 읽기만 하므로 다른 화면에서 고치면 바로 다시 그려진다 (R8).
 */
function MonthPage({
  index,
  todayKey,
  onOpen,
  className,
  onAnimationEnd,
  selection = null,
  draft = null,
  onDraftSubmit = noop,
  onDraftCancel = noop,
  chipDrag,
  drop = null,
  reviewDay = null,
}: MonthPageProps) {
  const weeks = useMemo(() => getMonthGrid(Math.floor(index / 12), index % 12, 1), [index]);
  const plan = usePlan().state;
  const applications = useApplications().state;
  const calendar = useCalendar().state;
  const planData = plan.kind === "ready" ? plan.data : null;
  const appData = applications.kind === "ready" ? applications.data : null;
  const events = calendar.kind === "ready" ? calendar.data.events : NO_EVENTS;

  const layouts = useMemo(() => {
    const from = weeks[0][0].key;
    const to = weeks[weeks.length - 1][6].key;
    const items = buildCalItems({ plan: planData, applications: appData, events }, from, to);
    return weeks.map((week) => layoutWeek(items, week[0].key));
  }, [weeks, planData, appData, events]);

  return (
    <div
      className={className}
      style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}
      onAnimationEnd={onAnimationEnd}
    >
      {weeks.map((week, w) => (
        <WeekRow
          key={week[0].key}
          week={week}
          todayKey={todayKey}
          isFirstWeek={w === 0}
          isLastWeek={w === weeks.length - 1}
          layout={layouts[w]}
          onOpen={onOpen}
          selection={selection}
          draft={draft}
          onDraftSubmit={onDraftSubmit}
          onDraftCancel={onDraftCancel}
          chipDrag={chipDrag}
          drop={drop}
          reviewDay={reviewDay}
        />
      ))}
    </div>
  );
}

export default MonthGrid;
