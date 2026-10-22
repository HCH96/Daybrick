import "./SummaryStrip.css";

interface SummaryItemDef {
  id: string;
  label: string; // 칸 이름
  emptyNote: string; // 기능이 연결되기 전 아래에 보일 안내
}

/**
 * 홈 상단 요약 줄 4칸. 지금은 값 대신 "—"(기록 없음)를 보여준다.
 * 기능을 만들면 항목에 값을 연결한다. 지금은 눌러도 이동하지 않는다 (2026-10-22 결정).
 */
const summaryItems: SummaryItemDef[] = [
  { id: "todos", label: "오늘 할 일", emptyNote: "캘린더 연결 전" },
  { id: "focus", label: "오늘 집중", emptyNote: "타이머 연결 전" },
  { id: "next-event", label: "다음 일정", emptyNote: "스케줄러 연결 전" },
  { id: "deadline", label: "가장 가까운 마감", emptyNote: "지원 관리 연결 전" },
];

function SummaryStrip() {
  return (
    <section className="summary-strip" aria-label="오늘 요약">
      {summaryItems.map((item) => (
        <div key={item.id} className="summary-strip__item">
          <div className="summary-strip__label">{item.label}</div>
          <div className="summary-strip__value" aria-label="기록 없음">
            —
          </div>
          <div className="summary-strip__note">{item.emptyNote}</div>
        </div>
      ))}
    </section>
  );
}

export default SummaryStrip;
