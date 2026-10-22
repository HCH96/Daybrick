import { formatKoreanDate } from "../../utils/date";
import QuickAdd from "./QuickAdd";

/** 홈 상단: 왼쪽 오늘 날짜 + 인사 문구, 오른쪽 빠른 추가 칸 */
function HomeHeader() {
  return (
    <header className="home-header">
      <div>
        <div className="home-header__date">{formatKoreanDate(new Date())}</div>
        <h1 className="home-header__greeting">좋은 하루예요</h1>
      </div>
      <QuickAdd />
    </header>
  );
}

export default HomeHeader;
