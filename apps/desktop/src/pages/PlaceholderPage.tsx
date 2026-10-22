import type { ComponentType } from "react";
import { WrenchIcon } from "../components/icons/StatusIcons";
import "./PlaceholderPage.css";

interface PlaceholderPageProps {
  title: string; // 화면 제목 (메뉴 이름)
  featureName: string; // 나중에 이 화면을 채울 기능 이름
}

/** 아직 만들지 않은 기능 화면: 제목 + "준비 중" 안내 */
function PlaceholderPage({ title, featureName }: PlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      <h1 className="placeholder-page__title">{title}</h1>
      <div className="placeholder-page__notice">
        <div className="placeholder-page__icon" aria-hidden="true">
          <WrenchIcon />
        </div>
        <div className="placeholder-page__msg">준비 중인 화면이에요</div>
        <div>{featureName} 기능을 만들면 이 화면이 채워져요</div>
      </div>
    </section>
  );
}

/** pages.ts의 화면 목록에 넣을 수 있도록 제목이 정해진 빈 페이지 컴포넌트를 만든다. */
export function makePlaceholderPage(title: string, featureName: string): ComponentType {
  function Placeholder() {
    return <PlaceholderPage title={title} featureName={featureName} />;
  }
  return Placeholder;
}

export default PlaceholderPage;
