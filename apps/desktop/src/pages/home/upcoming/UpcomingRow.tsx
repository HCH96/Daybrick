import type { CSSProperties } from "react";
import { useNavigation } from "../../../app/navigation";
import { AppKindIcon, FlagIcon } from "../../../components/icons/CalendarIcons";
import type { UpcomingRow as UpcomingRowData } from "../../../features/home/upcoming";

interface UpcomingRowProps {
  row: UpcomingRowData;
}

/** 종류 표시: 태스크 = 색 점, 지원 = 이니셜 배지, 깃발 = 프로젝트 색 깃발, 개인 = 기본 색 점 (R33) */
function Mark({ row }: UpcomingRowProps) {
  switch (row.kind) {
    case "task":
      return <i className="upcoming-row__dot" style={{ "--c": row.color } as CSSProperties} />;
    case "app":
      return <i className={`upcoming-row__ini upcoming-row__ini--${row.badge}`}>{row.initial}</i>;
    case "flag":
      return (
        <span className="upcoming-row__flag" style={{ "--c": row.color } as CSSProperties}>
          <FlagIcon done={row.done} />
        </span>
      );
    case "personal":
      return <i className="upcoming-row__dot" />;
  }
}

/** 다가오는 7일의 한 줄: 시각 + 종류 표시 + 제목. 누르면 캘린더로 (R33–R34) */
function UpcomingRow({ row }: UpcomingRowProps) {
  const { navigate } = useNavigation();
  const time = row.kind === "app" || row.kind === "personal" ? row.time : null;
  const sub = row.kind === "app" || row.kind === "flag" ? row.sub : null;
  const tooltip = sub ? `${row.title} · ${sub}` : row.title;

  return (
    <button type="button" className="upcoming-row" title={tooltip} onClick={() => navigate("calendar")}>
      <span className="upcoming-row__time">{time ?? ""}</span>
      <span className="upcoming-row__mark">
        <Mark row={row} />
      </span>
      <span className="upcoming-row__title">
        {row.title}
        {sub && <em> · {sub}</em>}
      </span>
      {row.kind === "personal" && row.endLabel && <span className="upcoming-row__end">{row.endLabel}</span>}
      {row.kind === "app" && (
        <AppKindIcon
          size={16}
          kind={row.eventKind}
          className={`upcoming-row__kind${row.eventKind === "interview" ? " upcoming-row__kind--on" : ""}`}
        />
      )}
    </button>
  );
}

export default UpcomingRow;
