import HomeHeader from "./HomeHeader";
import SummaryStrip from "./SummaryStrip";
import DashboardCard from "./DashboardCard";
import { dashboardCards } from "./dashboardCards";
import "./HomePage.css";

/** 홈 대시보드: 상단(날짜, 인사, 빠른 추가) + 요약 줄 4칸 + 12칸 벤토 그리드 (목업 main-page.html#home) */
function HomePage() {
  return (
    <div className="home-page">
      <HomeHeader />
      <SummaryStrip />
      <div className="home-page__grid">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.id}
            title={card.title}
            linkTo={card.linkTo}
            size={card.size}
            body={card.body}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
