import type { ComponentType } from "react";
import type { PageId } from "../../app/types";
import { useNavigation } from "../../app/navigation";
import type { CardSize } from "./dashboardCards";
import "./DashboardCard.css";

interface DashboardCardProps {
  title: string;
  linkTo: PageId;
  linkLabel: string;
  size: CardSize;
  body: ComponentType;
}

/**
 * 홈 카드 공통 틀 (R16): 제목(누르면 이동) + 오른쪽 위 링크 "캘린더 ›" + 본문.
 * size에 따라 그리드 칸 수가 정해진다. large 카드는 본문이 카드 높이를 키우지 않고 안에서 스크롤한다.
 */
function DashboardCard({ title, linkTo, linkLabel, size, body: Body }: DashboardCardProps) {
  const { navigate } = useNavigation();
  const goTo = () => navigate(linkTo);

  return (
    <section className={`dashboard-card dashboard-card--${size}`}>
      <div className="dashboard-card__head">
        <button type="button" className="dashboard-card__title" onClick={goTo}>
          {title}
        </button>
        <button type="button" className="dashboard-card__link" onClick={goTo}>
          {linkLabel} ›
        </button>
      </div>
      <div className="dashboard-card__body">
        {size === "large" ? (
          <div className="dashboard-card__scroll">
            <Body />
          </div>
        ) : (
          <Body />
        )}
      </div>
    </section>
  );
}

export default DashboardCard;
