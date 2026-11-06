import type { ComponentType } from "react";
import type { PageId } from "../../app/types";
import { PAGE_LABELS } from "../../app/pageLabels";
import { useNavigation } from "../../app/navigation";
import { withRo } from "../../utils/korean";
import { WarnIcon } from "../../components/icons/ServerIcons";
import {
  ApplicationsIcon,
  CalendarNavIcon,
  HomeIcon,
  JobSearchIcon,
  PlanIcon,
  ProjectsIcon,
  SettingsIcon,
  TodayIcon,
} from "../../components/icons/NavIcons";
import "./CardState.css";

/** 빈 상태에 그릴 메뉴 아이콘 (사이드바와 같은 아이콘) */
const MENU_ICONS: Record<PageId, ComponentType> = {
  home: HomeIcon,
  plan: PlanIcon,
  projects: ProjectsIcon,
  calendar: CalendarNavIcon,
  applications: ApplicationsIcon,
  "job-search": JobSearchIcon,
  today: TodayIcon,
  settings: SettingsIcon,
};

export type CardStateProps =
  | { kind: "loading" }
  /** message: "프로젝트를 불러오지 못했어요"처럼 문장 전체 */
  | { kind: "error"; message: string }
  /**
   * linkTo: 아이콘과 이동 버튼의 메뉴. message: 굵은 첫 줄, description: 둘째 줄(무엇이 보일지).
   * hideButton이면 이동 버튼을 그리지 않는다 (예: 새 추천 공고 0개).
   */
  | { kind: "empty"; linkTo: PageId; message: string; description?: string; hideButton?: boolean };

/** 홈 카드 본문의 세 상태: 불러오는 중 / 못 읽음 / 비었음 (R17, 목업 part-empty.html) */
function CardState(props: CardStateProps) {
  const { navigate } = useNavigation();

  if (props.kind === "loading") {
    return (
      <div className="card-state" role="status">
        <div className="card-state__skel" aria-hidden="true">
          <i style={{ width: "90%" }} />
          <i style={{ width: "70%" }} />
          <i style={{ width: "80%" }} />
        </div>
        <div className="card-state__loading-text">불러오는 중…</div>
      </div>
    );
  }

  if (props.kind === "error") {
    return (
      <div className="card-state card-state--error" role="alert">
        <div className="card-state__icon" aria-hidden="true">
          <WarnIcon />
        </div>
        <div>{props.message}</div>
      </div>
    );
  }

  const Icon = MENU_ICONS[props.linkTo];
  const { linkTo } = props;
  return (
    <div className="card-state">
      <div className="card-state__icon" aria-hidden="true">
        <Icon />
      </div>
      <div className="card-state__msg">{props.message}</div>
      {props.description && <div>{props.description}</div>}
      {!props.hideButton && (
        <button type="button" className="card-state__button" onClick={() => navigate(linkTo)}>
          {withRo(PAGE_LABELS[linkTo])} 가기
        </button>
      )}
    </div>
  );
}

export default CardState;
