import { useApplications } from "../../features/applications/store";
import { summarizeApplications, type StatusCount } from "../../features/applications/summary";
import CardState from "./CardState";
import "./ApplicationsSummaryCard.css";

/** 상태 한 칸: 개수 + 이름, 세부 단계가 있으면 아래에 "과제 1 · 코테 1" (길면 말줄임, 전체는 title로) */
function StatusTile({ item }: { item: StatusCount }) {
  const stages = item.stages.map((s) => `${s.label} ${s.count}`).join(" · ");
  return (
    <div className="apps-summary__tile" style={{ background: item.softColor, color: item.color }}>
      <div className="apps-summary__count">{item.count}</div>
      <div className="apps-summary__label">{item.label}</div>
      {stages && (
        <div className="apps-summary__stages" title={stages}>
          {stages}
        </div>
      )}
    </div>
  );
}

/**
 * 홈 "지원 현황" 카드 본문 (R42, 목업 dash.html dash-apps): 종료를 뺀 상태별 개수와 세부 단계별 개수
 * (지원 관리 R36–R37). 4칸 폭 카드에 맞게 2×2 타일로 놓는다.
 */
function ApplicationsSummaryCard() {
  const { state } = useApplications();

  if (state.kind === "loading") return <CardState kind="loading" />;
  if (state.kind === "error") return <CardState kind="error" message="지원 기록을 불러오지 못했어요" />;

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
