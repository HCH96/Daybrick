import { useApplications } from "../../features/applications/store";
import { summarizeApplications, type StatusCount } from "../../features/applications/summary";
import "./ApplicationsSummaryCard.css";

/** 상태 한 칸: 개수 + 이름, 세부 단계가 있으면 아래에 "과제 1 · 코테 1" */
function StatusTile({ item }: { item: StatusCount }) {
  return (
    <div className="apps-summary__tile" style={{ background: item.softColor, color: item.color }}>
      <div className="apps-summary__count">{item.count}</div>
      <div className="apps-summary__label">{item.label}</div>
      {item.stages.length > 0 && (
        <div className="apps-summary__stages">
          {item.stages.map((s) => `${s.label} ${s.count}`).join(" · ")}
        </div>
      )}
    </div>
  );
}

/** 홈 "지원 현황" 카드 본문: 종료를 뺀 상태별 개수와 세부 단계별 개수 (R36–R37) */
function ApplicationsSummaryCard() {
  const { state } = useApplications();

  if (state.kind === "loading") {
    return <div className="apps-summary__notice">불러오는 중…</div>;
  }
  if (state.kind === "error") {
    return <div className="apps-summary__notice">지원 기록을 불러오지 못했어요</div>;
  }

  const summary = summarizeApplications(state.data.applications);

  return (
    <div className="apps-summary">
      <div className="apps-summary__tiles">
        {summary.statuses.map((item) => (
          <StatusTile key={item.status} item={item} />
        ))}
      </div>
      <div className="apps-summary__total">
        {summary.activeCount > 0 ? `진행 중 ${summary.activeCount}곳` : "진행 중인 지원이 없어요"}
      </div>
    </div>
  );
}

export default ApplicationsSummaryCard;
