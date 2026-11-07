import { useMemo, type ReactNode } from "react";
import { useOpenTarget } from "../../app/pageIntent";
import type { PageId } from "../../app/types";
import { useApplications } from "../../features/applications/store";
import { useCalendar } from "../../features/calendar/store";
import { ddayLabel, nearestDeadline, nextEvent, shortDayLabel, todayDone } from "../../features/home/summary";
import { buildUpcoming } from "../../features/home/upcoming";
import { usePlan } from "../../features/plan/store";
import { formatClock } from "../../features/today/format";
import { dayTotal } from "../../features/today/stats";
import { useToday } from "../../features/today/store";
import { useNow } from "../../features/today/useNow";
import "./SummaryStrip.css";

interface SummaryStripProps {
  todayKey: string; // "YYYY-MM-DD"
}

type LoadKind = "loading" | "ready" | "error";

/** 저장소가 준비 전이면 값 자리에 보일 회색 문장. 준비됐으면 null */
function notReadyText(kind: LoadKind): string | null {
  if (kind === "loading") return "불러오는 중…";
  if (kind === "error") return "불러오지 못했어요";
  return null;
}

interface ItemProps {
  label: string;
  linkLabel: string; // 오른쪽 위에 흐리게 적는 이동할 곳
  to: PageId;
  children: ReactNode;
}

/** 요약 칸 하나의 틀. 누르면 해당 메뉴로 이동한다 (R13) */
function SummaryItem({ label, linkLabel, to, children }: ItemProps) {
  const openTarget = useOpenTarget();
  return (
    <button type="button" className="summary-strip__item" onClick={() => openTarget({ page: to })}>
      <div className="summary-strip__label">
        {label}
        <span className="summary-strip__link">{linkLabel} ›</span>
      </div>
      {children}
    </button>
  );
}

/** 빈 값·불러오는 중 등 회색 문장 */
function NoneValue({ text }: { text: string }) {
  return <div className="summary-strip__value summary-strip__value--none">{text}</div>;
}

/** 큰 날짜(또는 D-n) + 제목 */
function WhenValue({ when, title }: { when: string; title: string }) {
  return (
    <div className="summary-strip__value" title={`${when} ${title}`}>
      <span className="summary-strip__when">{when}</span>
      <span className="summary-strip__title">{title}</span>
    </div>
  );
}

/** 오늘 집중 (R23): 오늘 합계 / 하루 목표. 타이머가 도는 동안 1초마다 갱신 (요약 칸에는 막대를 넣지 않는다) */
function FocusItem({ todayKey }: SummaryStripProps) {
  const { state } = useToday();
  const ticking = state.kind === "ready" && state.data.running?.state === "running";
  const now = useNow(ticking);

  let body: ReactNode;
  if (state.kind !== "ready") {
    body = <NoneValue text={notReadyText(state.kind) ?? ""} />;
  } else {
    const total = dayTotal(state.data, todayKey, now);
    const goalMs = state.data.settings.dailyGoalMinutes * 60000;
    body = (
      <div className="summary-strip__value">
        {formatClock(total)}
        <small>/ {formatClock(goalMs)}</small>
      </div>
    );
  }
  return (
    <SummaryItem label="오늘 집중" linkLabel="투데이" to="today">
      {body}
    </SummaryItem>
  );
}

/** 오늘 완료 (R24): 완료 / 전체 */
function DoneItem({ todayKey }: SummaryStripProps) {
  const { state } = usePlan();
  let body: ReactNode;
  if (state.kind !== "ready") {
    body = <NoneValue text={notReadyText(state.kind) ?? ""} />;
  } else {
    const { done, total } = todayDone(state.data, todayKey);
    body =
      total === 0 ? (
        <NoneValue text="오늘 태스크 없음" />
      ) : (
        <div className="summary-strip__value">
          {done}
          <small>/ {total}</small>
        </div>
      );
  }
  return (
    <SummaryItem label="오늘 완료" linkLabel="투데이" to="today">
      {body}
    </SummaryItem>
  );
}

/** 다음 일정 (R25): 7일 안 개인 일정·지원 전형 중 지금 이후 가장 가까운 것. 1분마다 다시 본다 */
function NextEventItem({ todayKey }: SummaryStripProps) {
  const { state: apps } = useApplications();
  const { state: cal } = useCalendar();
  const now = useNow(true, 60000);

  const upcoming = useMemo(
    () =>
      buildUpcoming(
        {
          plan: null, // 태스크는 다음 일정에 넣지 않는다
          applications: apps.kind === "ready" ? apps.data : null,
          events: cal.kind === "ready" ? cal.data.events : [],
        },
        todayKey,
      ),
    [apps, cal, todayKey],
  );

  let body: ReactNode;
  if (apps.kind === "loading" || cal.kind === "loading") {
    body = <NoneValue text="불러오는 중…" />;
  } else if (apps.kind === "error" && cal.kind === "error") {
    body = <NoneValue text="불러오지 못했어요" />;
  } else {
    const next = nextEvent(upcoming, new Date(now));
    body =
      next === null ? (
        <NoneValue text="7일 안에 일정 없음" />
      ) : (
        <WhenValue
          when={`${shortDayLabel(next.dateKey, todayKey)}${next.time ? ` ${next.time}` : ""}`}
          title={next.title}
        />
      );
  }
  return (
    <SummaryItem label="다음 일정" linkLabel="캘린더" to="calendar">
      {body}
    </SummaryItem>
  );
}

/** 가까운 마감 (R26): 지원 마감·과제 마감 중 오늘 이후 가장 가까운 것 */
function DeadlineItem({ todayKey }: SummaryStripProps) {
  const { state } = useApplications();
  let body: ReactNode;
  if (state.kind !== "ready") {
    body = <NoneValue text={notReadyText(state.kind) ?? ""} />;
  } else {
    const deadline = nearestDeadline(state.data, todayKey);
    body =
      deadline === null ? (
        <NoneValue text="남은 마감 없음" />
      ) : (
        <WhenValue when={ddayLabel(deadline.days)} title={deadline.title} />
      );
  }
  return (
    <SummaryItem label="가까운 마감" linkLabel="지원 관리" to="applications">
      {body}
    </SummaryItem>
  );
}

/** 홈 상단 요약 줄 4칸 (R13): 오늘 집중 · 오늘 완료 · 다음 일정 · 가까운 마감. 칸을 누르면 해당 메뉴로 */
function SummaryStrip({ todayKey }: SummaryStripProps) {
  return (
    <section className="summary-strip" aria-label="요약">
      <FocusItem todayKey={todayKey} />
      <DoneItem todayKey={todayKey} />
      <NextEventItem todayKey={todayKey} />
      <DeadlineItem todayKey={todayKey} />
    </section>
  );
}

export default SummaryStrip;
