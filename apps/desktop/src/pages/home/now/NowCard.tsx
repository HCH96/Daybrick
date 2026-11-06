import { usePlan } from "../../../features/plan/store";
import { useToday } from "../../../features/today/store";
import { useTodayKey } from "../../../features/today/useTodayKey";
import CardState from "../CardState";
import NowTaskList from "./NowTaskList";
import NowTimer from "./NowTimer";
import "./Now.css";

/**
 * 홈 "지금 하는 것" 카드 본문 (R35–R37).
 * 투데이 공용 타이머 저장소를 그대로 읽어, 타이머가 있으면(실행 중·일시정지) 타이머를, 없으면 오늘 태스크를 보인다.
 */
function NowCard() {
  const { state: plan } = usePlan();
  const { state: today } = useToday();
  const todayKey = useTodayKey();

  if (plan.kind === "loading" || today.kind === "loading") return <CardState kind="loading" />;
  if (plan.kind === "error") return <CardState kind="error" message="태스크를 불러오지 못했어요" />;
  if (today.kind === "error") return <CardState kind="error" message="타이머 기록을 불러오지 못했어요" />;

  const running = today.data.running;
  if (running) return <NowTimer plan={plan.data} today={today.data} running={running} todayKey={todayKey} />;
  return <NowTaskList plan={plan.data} todayKey={todayKey} />;
}

export default NowCard;
