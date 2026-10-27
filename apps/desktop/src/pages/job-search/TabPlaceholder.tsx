import { WrenchIcon } from "../../components/icons/StatusIcons";
import "../PlaceholderPage.css";

/** 아직 만들지 않은 탭의 내용 자리. 각 탭을 만드는 단계에서 실제 내용으로 바꾼다. */
function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="placeholder-page__notice">
      <div className="placeholder-page__icon" aria-hidden="true">
        <WrenchIcon />
      </div>
      <div className="placeholder-page__msg">{label} 탭은 준비 중이에요</div>
    </div>
  );
}

export default TabPlaceholder;
