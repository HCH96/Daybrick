import { formatKoreanDate, parseDateKey } from "../../utils/date";
import QuickAdd from "./QuickAdd";

interface HomeHeaderProps {
  todayKey: string; // "YYYY-MM-DD"
}

/** 홈 상단: 왼쪽 오늘 날짜 + 인사 문구 (R10–R11), 오른쪽 빠른 추가 칸 (R12) */
function HomeHeader({ todayKey }: HomeHeaderProps) {
  return (
    <header className="home-header">
      <div>
        <div className="home-header__date">{formatKoreanDate(parseDateKey(todayKey))}</div>
        <h1 className="home-header__greeting">좋은 하루예요</h1>
      </div>
      <QuickAdd todayKey={todayKey} />
    </header>
  );
}

export default HomeHeader;
