import { useTodayKey } from "../../features/today/useTodayKey";
import HomeHeader from "./HomeHeader";
import SummaryStrip from "./SummaryStrip";
import DashboardCard from "./DashboardCard";
import { dashboardCards } from "./dashboardCards";
import "./HomePage.css";

/**
 * 홈 대시보드: 상단(날짜, 인사, 빠른 추가) + 요약 줄 4칸 + 12칸 벤토 그리드에 카드 6개 (목업 dash.html).
 * 오늘 날짜는 PC 시계 기준이고, 자정이 지나면 키가 바뀌어 새 날짜로 다시 그린다 (R28).
 * 카드 본문은 각자 `useTodayKey()`를 불러 같은 자정에 함께 바뀐다.
 */
function HomePage() {
  const todayKey = useTodayKey();

  return (
    <div className="home-page">
      <HomeHeader todayKey={todayKey} />
      <SummaryStrip todayKey={todayKey} />
      <div className="home-page__grid">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.id}
            title={card.title}
            linkTo={card.linkTo}
            linkLabel={card.linkLabel}
            size={card.size}
            body={card.body}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
