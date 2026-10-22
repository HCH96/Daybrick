import type { PageId } from "../../app/types";
import { PAGE_LABELS } from "../../app/pageLabels";
import { useNavigation } from "../../app/navigation";
import { withRo } from "../../utils/korean";
import { BricksIcon } from "../icons/StatusIcons";
import "./EmptyState.css";

interface EmptyStateProps {
  description: string; // 기능이 연결되면 무엇이 보일지 안내
  linkTo: PageId; // 버튼을 누르면 이동할 메뉴
}

/** 기능이 아직 연결되지 않은 카드 본문: 아이콘 + 안내 문구 + 이동 버튼 */
function EmptyState({ description, linkTo }: EmptyStateProps) {
  const { navigate } = useNavigation();
  const label = PAGE_LABELS[linkTo];

  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <BricksIcon />
      </div>
      <div className="empty-state__msg">아직 연결되지 않았어요</div>
      <div>{description}</div>
      <button type="button" className="empty-state__button" onClick={() => navigate(linkTo)}>
        {withRo(label)} 가기
      </button>
    </div>
  );
}

export default EmptyState;
