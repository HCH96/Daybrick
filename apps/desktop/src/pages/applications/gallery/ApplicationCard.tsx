import { BuildingIcon } from "../../../components/icons/ApplicationIcons";
import { getSelectedOption } from "../../../features/applications/properties";
import { getLastEvent, getNextItem } from "../../../features/applications/schedule";
import { EVENT_KIND_LABELS } from "../../../features/applications/statuses";
import type { Application, PropertyDef } from "../../../features/applications/types";
import { parseDateKey } from "../../../utils/date";
import StatusBadge from "../status/StatusBadge";
import NextEventLabel from "../schedule/NextEventLabel";
import OptionChip from "../properties/OptionChip";
import PriorityBars from "./PriorityBars";
import "./ApplicationCard.css";

/** 카드 앞면이 쓰는 역할 속성들. 사용자가 지웠으면 null. */
export interface CardProperties {
  company: PropertyDef | null;
  deadline: PropertyDef | null;
  priority: PropertyDef | null;
  result: PropertyDef | null;
}

interface ApplicationCardProps {
  application: Application;
  properties: CardProperties;
  today: Date;
  onOpen: (id: string) => void;
}

/** 종료 카드 아래쪽: "마지막 일정 10/16 면접" */
function LastEventLine({ application }: { application: Application }) {
  const last = getLastEvent(application);
  if (!last) return <span className="next-event next-event--none">일정 없음</span>;
  const date = parseDateKey(last.date);
  return (
    <span className="next-event next-event--none">
      마지막 일정 {date.getMonth() + 1}/{date.getDate()} {EVENT_KIND_LABELS[last.kind]}
    </span>
  );
}

/** 갤러리 카드 앞면: 제목, 상태 배지, 회사, 다음 일정, 우선순위 (R6) */
function ApplicationCard({ application, properties, today, onOpen }: ApplicationCardProps) {
  const closed = application.status === "closed";
  const company = getSelectedOption(application, properties.company);
  const priority = getSelectedOption(application, properties.priority);
  // 종료 카드는 상태 배지 옆에 결과 칩 (목업 "종료 카드")
  const result = closed ? getSelectedOption(application, properties.result) : null;

  // 누르면 상세 팝업 (R12). 키보드로도 열 수 있게 버튼 역할을 준다.
  return (
    <article
      className={closed ? "app-card app-card--ended" : "app-card"}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(application.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(application.id);
        }
      }}
    >
      <div className={application.title ? "app-card__title" : "app-card__title app-card__title--empty"}>
        {application.title || "제목 없음"}
      </div>
      <div className="app-card__badges">
        <StatusBadge status={application.status} stage={application.stage} />
        {result && <OptionChip name={result.name} color={result.color} />}
      </div>
      {properties.company && (
        <div className={company ? "app-card__company" : "app-card__company app-card__company--empty"}>
          <BuildingIcon />
          {company ? company.name : "회사 없음"}
        </div>
      )}
      <div className="app-card__foot">
        {closed ? (
          <LastEventLine application={application} />
        ) : (
          <NextEventLabel item={getNextItem(application, properties.deadline, today)} emptyText="예정된 일정 없음" />
        )}
        <PriorityBars option={priority} />
      </div>
    </article>
  );
}

export default ApplicationCard;
