import { useApplications } from "../../features/applications/store";
import { isActive } from "../../features/applications/schedule";
import "./SummaryStrip.css";

interface SummaryItemDef {
  id: string;
  label: string; // 칸 이름
  emptyNote: string; // 기능이 연결되기 전 아래에 보일 안내
}

/**
 * 홈 상단 요약 줄 4칸. 지금은 값 대신 "—"(기록 없음)를 보여준다.
 * 기능을 만들면 항목에 값을 연결한다. 지금은 눌러도 이동하지 않는다 (2026-10-22 결정).
 * "가장 가까운 마감" 칸 아래 줄에는 지원 관리의 진행 중 개수를 보여준다 (D19).
 */
const summaryItems: SummaryItemDef[] = [
  { id: "todos", label: "오늘 할 일", emptyNote: "캘린더 연결 전" },
  { id: "focus", label: "오늘 집중", emptyNote: "타이머 연결 전" },
  { id: "next-event", label: "다음 일정", emptyNote: "스케줄러 연결 전" },
  { id: "deadline", label: "가장 가까운 마감", emptyNote: "지원 관리 연결 전" },
];

/** 지원 데이터가 준비됐으면 "진행 중 N곳", 아니면 null */
function useActiveApplicationsNote(): string | null {
  const { state } = useApplications();
  if (state.kind !== "ready") return null;
  return `진행 중 ${state.data.applications.filter(isActive).length}곳`;
}

function SummaryStrip() {
  const applicationsNote = useActiveApplicationsNote();
  const noteOf = (item: SummaryItemDef) =>
    item.id === "deadline" && applicationsNote !== null ? applicationsNote : item.emptyNote;

  return (
    <section className="summary-strip" aria-label="오늘 요약">
      {summaryItems.map((item) => (
        <div key={item.id} className="summary-strip__item">
          <div className="summary-strip__label">{item.label}</div>
          <div className="summary-strip__value" aria-label="기록 없음">
            —
          </div>
          <div className="summary-strip__note">{noteOf(item)}</div>
        </div>
      ))}
    </section>
  );
}

export default SummaryStrip;
