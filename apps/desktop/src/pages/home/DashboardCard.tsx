import type { ComponentType } from "react";
import type { PageId } from "../../app/types";
import { PAGE_LABELS } from "../../app/pageLabels";
import { useNavigation } from "../../app/navigation";
import { withRo } from "../../utils/korean";
import type { CardSize } from "./dashboardCards";
import "./DashboardCard.css";

interface DashboardCardProps {
  title: string;
  linkTo: PageId;
  size: CardSize;
  body: ComponentType;
}

/** 홈 카드 공통 틀: 제목(누르면 이동) + 오른쪽 위 이동 링크 + 본문. size에 따라 그리드 칸 수가 정해진다. */
function DashboardCard({ title, linkTo, size, body: Body }: DashboardCardProps) {
  const { navigate } = useNavigation();
  const goTo = () => navigate(linkTo);

  return (
    <section className={`dashboard-card dashboard-card--${size}`}>
      <div className="dashboard-card__head">
        <button type="button" className="dashboard-card__title" onClick={goTo}>
          {title}
        </button>
        <button type="button" className="dashboard-card__link" onClick={goTo}>
          {withRo(PAGE_LABELS[linkTo])} 가기 →
        </button>
      </div>
      <div className="dashboard-card__body">
        <Body />
      </div>
    </section>
  );
}

export default DashboardCard;
