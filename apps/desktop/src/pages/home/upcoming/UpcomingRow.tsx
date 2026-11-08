import type { CSSProperties } from "react";
import { useNavigation } from "../../../app/navigation";
import { AppKindIcon, FlagIcon } from "../../../components/icons/CalendarIcons";
import type { UpcomingRow as UpcomingRowData } from "../../../features/home/upcoming";

interface UpcomingRowProps {
  row: UpcomingRowData;
}

/** 칩 왼쪽 표시: 지원 = 이니셜 배지, 깃발 = 프로젝트 색 깃발, 개인 = 기본 색 점. 태스크는 색 띠만 (R33) */
function Mark({ row }: UpcomingRowProps) {
  switch (row.kind) {
    case "task":
      return null;
    case "app":
      return <i className={`upcoming-row__ini upcoming-row__ini--${row.badge}`}>{row.initial}</i>;
    case "flag":
      return (
        <span className="upcoming-row__flag">
          <FlagIcon done={row.done} />
        </span>
      );
    case "personal":
      return <i className="upcoming-row__dot" />;
  }
}

/** 다가오는 7일의 칩 하나: 종류 표시 + 제목 + 시각(오른쪽). 누르면 캘린더로 (R33–R34) */
function UpcomingRow({ row }: UpcomingRowProps) {
  const { navigate } = useNavigation();
  const time = row.kind === "app" || row.kind === "personal" ? row.time : null;
  const sub = row.kind === "app" || row.kind === "flag" ? row.sub : null;
  const tooltip = sub ? `${row.title} · ${sub}` : row.title;
  // 태스크·깃발은 왼쪽에 카테고리·프로젝트 색 띠
  const band = row.kind === "task" || row.kind === "flag";
  const style = band ? ({ "--c": row.color } as CSSProperties) : undefined;

  return (
    <button
      type="button"
      className={`upcoming-row${band ? " upcoming-row--band" : ""}`}
      style={style}
      title={tooltip}
      onClick={() => navigate("calendar")}
    >
      <Mark row={row} />
      <span className="upcoming-row__title">
        {row.title}
        {sub && <em> · {sub}</em>}
      </span>
      {row.kind === "personal" && row.endLabel && <span className="upcoming-row__end">{row.endLabel}</span>}
      <span className="upcoming-row__aside">
        {time && <time className="upcoming-row__time">{time}</time>}
        {row.kind === "app" && (
          <AppKindIcon
            size={16}
            kind={row.eventKind}
            className={`upcoming-row__kind${row.eventKind === "interview" ? " upcoming-row__kind--on" : ""}`}
          />
        )}
      </span>
    </button>
  );
}

export default UpcomingRow;
