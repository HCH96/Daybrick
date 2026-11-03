import type { CSSProperties } from "react";
import { formatDuration } from "../../../features/today/format";
import type { CategoryTotal } from "../../../features/today/stats";

/** 카테고리별 시간 (R29): 쌓인 가로 막대 + 범례(색 점·이름·시간). 기록이 없으면 빈 막대와 안내 */
function CategoryBars({ rows }: { rows: CategoryTotal[] }) {
  const total = rows.reduce((s, r) => s + r.ms, 0);

  return (
    <>
      <div className="today-summary__catbar">
        {rows.map((r) => (
          <i key={r.id ?? "none"} style={{ width: `${(r.ms / total) * 100}%`, "--c": r.color } as CSSProperties} />
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="today-summary__legend">아직 오늘 기록이 없어요</div>
      ) : (
        <div className="today-summary__legend">
          {rows.map((r) => (
            <span key={r.id ?? "none"} style={{ "--c": r.color } as CSSProperties}>
              <span className="today-summary__dot" />
              {r.name} <b>{formatDuration(r.ms)}</b>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export default CategoryBars;
