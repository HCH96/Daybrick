import { useState } from "react";
import { AppKindIcon } from "../../../components/icons/CalendarIcons";
import { badgeColor, badgeInitial } from "../../../features/calendar/badge";
import type { SchedPillData } from "../../../features/plan/applicationEvents";
import SchedTooltip from "./SchedTooltip";

interface SchedPillProps {
  pill: SchedPillData;
  dragging: boolean; // 다른 것을 끄는 중이면 풍선을 띄우지 않는다
  onOpen: (applicationId: string) => void;
}

/**
 * 지원 일정 알약 하나 (R31·R32). 캘린더 지원 칩과 같은 모양:
 * 회색 바탕 + 회사 머리글자 배지 → 회사(또는 카드 제목) → 있으면 시간 → 오른쪽 종류 아이콘 (면접만 보라).
 * 끌기를 시작하지 않으므로 끌리지 않고(D22), 누르면 지원관리 상세 팝업을 연다 (D8·D16).
 */
function SchedPill({ pill, dragging, onOpen }: SchedPillProps) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const isInterview = pill.kind === "interview";

  return (
    <>
      <button
        type="button"
        className="plan-ev"
        aria-label={`${pill.kindLabel} ${pill.heading}${pill.time ? ` ${pill.time}` : ""}`}
        onMouseEnter={(e) => setAnchor(e.currentTarget.getBoundingClientRect())}
        onMouseLeave={() => setAnchor(null)}
        onClick={() => {
          setAnchor(null);
          onOpen(pill.applicationId);
        }}
      >
        <i className={`plan-ev__ini plan-ev__ini--${badgeColor(pill.text)}`} aria-hidden="true">
          {badgeInitial(pill.text)}
        </i>
        <span className="plan-ev__text">{pill.text}</span>
        {pill.time && <em>{pill.time}</em>}
        <AppKindIcon kind={pill.kind} className={`plan-ev__kind${isInterview ? " plan-ev__kind--on" : ""}`} />
      </button>
      {anchor && !dragging && <SchedTooltip pill={pill} anchor={anchor} />}
    </>
  );
}

export default SchedPill;
