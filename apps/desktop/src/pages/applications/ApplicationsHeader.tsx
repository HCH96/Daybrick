import SegmentedControl, { type SegmentOption } from "../../components/common/SegmentedControl";
import { PlusIcon } from "../../components/icons/StatusIcons";
import { GridIcon, SmallCalendarIcon } from "../../components/icons/ViewIcons";
import { PAGE_LABELS } from "../../app/pageLabels";

export type ApplicationsView = "gallery" | "calendar";

const VIEW_OPTIONS: readonly SegmentOption<ApplicationsView>[] = [
  { value: "gallery", label: "갤러리", icon: <GridIcon /> },
  { value: "calendar", label: "달력", icon: <SmallCalendarIcon /> },
];

interface ApplicationsHeaderProps {
  subtitle: string;
  view: ApplicationsView;
  onViewChange: (view: ApplicationsView) => void;
  onCreate: () => void;
  canCreate: boolean;
}

/** 지원 관리 머리줄: 제목·부제, [갤러리 | 달력], [+ 새 지원] (R1·R2) */
function ApplicationsHeader({ subtitle, view, onViewChange, onCreate, canCreate }: ApplicationsHeaderProps) {
  return (
    <header className="applications-header">
      <div>
        <h1 className="applications-header__title">{PAGE_LABELS.applications}</h1>
        <div className="applications-header__sub">{subtitle}</div>
      </div>
      <div className="applications-header__right">
        <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={onViewChange} ariaLabel="보기 방식" />
        <button type="button" className="applications-header__new" onClick={onCreate} disabled={!canCreate}>
          <PlusIcon />새 지원
        </button>
      </div>
    </header>
  );
}

export default ApplicationsHeader;
