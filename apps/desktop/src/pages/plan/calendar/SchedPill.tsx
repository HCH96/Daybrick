import { useState, type ReactNode } from "react";
import { CodeIcon, FileIcon, FlagIcon, PeopleIcon } from "../../../components/icons/PlanIcons";
import type { SchedPillData } from "../../../features/plan/applicationEvents";
import type { EventKind } from "../../../features/applications/types";
import SchedTooltip from "./SchedTooltip";

interface SchedPillProps {
  pill: SchedPillData;
  dragging: boolean; // 다른 것을 끄는 중이면 풍선을 띄우지 않는다
  onOpen: (applicationId: string) => void;
}

/** 종류별 아이콘·색 클래스: 지원 마감 빨강 깃발, 과제 주황 문서, 코딩테스트 보라 코드, 면접 청록 사람 */
const KIND_STYLE: Record<EventKind, { icon: ReactNode; className: string }> = {
  "application-due": { icon: <FlagIcon />, className: "plan-ev--deadline" },
  "assignment-due": { icon: <FileIcon />, className: "plan-ev--task" },
  "coding-test": { icon: <CodeIcon />, className: "plan-ev--coding" },
  interview: { icon: <PeopleIcon />, className: "plan-ev--interview" },
};

/**
 * 지원 일정 알약 하나 (R31·R32): 아이콘 + 회사(또는 카드 제목) + 있으면 시간.
 * 끌기를 시작하지 않으므로 끌리지 않고(D22), 누르면 지원관리 상세 팝업을 연다 (D8·D16).
 */
function SchedPill({ pill, dragging, onOpen }: SchedPillProps) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const kind = KIND_STYLE[pill.kind];

  return (
    <>
      <button
        type="button"
        className={`plan-ev ${kind.className}`}
        aria-label={`${pill.kindLabel} ${pill.heading}${pill.time ? ` ${pill.time}` : ""}`}
        onMouseEnter={(e) => setAnchor(e.currentTarget.getBoundingClientRect())}
        onMouseLeave={() => setAnchor(null)}
        onClick={() => {
          setAnchor(null);
          onOpen(pill.applicationId);
        }}
      >
        {kind.icon}
        <span className="plan-ev__text">{pill.text}</span>
        {pill.time && <em>{pill.time}</em>}
      </button>
      {anchor && !dragging && <SchedTooltip pill={pill} anchor={anchor} />}
    </>
  );
}

export default SchedPill;
