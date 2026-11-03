import { PAGE_LABELS } from "../../app/pageLabels";
import { usePlan } from "../../features/plan/store";
import { useToday } from "../../features/today/store";
import { useTodayKey } from "../../features/today/useTodayKey";
import { formatKoreanDate, parseDateKey } from "../../utils/date";
import "./TodayPage.css";

/**
 * 투데이 화면 (R1·R3): 머리(투데이 · 오늘 날짜), 위 이번 주 진행 바 한 줄,
 * 아래 왼쪽 약 60% 칸반 · 오른쪽 약 40%(위 타이머, 아래 오늘 요약).
 * 오늘 날짜는 자정·창 포커스 때 다시 계산한다 (R4).
 * 1단계는 빈 틀만 그리고, 각 칸 내용은 다음 단계에서 채운다.
 */
function TodayPage() {
  const todayKey = useTodayKey();
  const plan = usePlan().state;
  const today = useToday().state;

  // 둘 중 하나라도 읽지 못했으면 실패 문구, 둘 다 준비되어야 내용을 그린다
  const kind = plan.kind === "error" || today.kind === "error" ? "error" : plan.kind === "ready" && today.kind === "ready" ? "ready" : "loading";
  const message = plan.kind === "error" ? plan.message : today.kind === "error" ? today.message : "";

  return (
    <div className="today-page">
      <header className="today-page__head">
        <h1 className="today-page__title">{PAGE_LABELS.today}</h1>
        <span className="today-page__date">{formatKoreanDate(parseDateKey(todayKey))}</span>
      </header>
      {kind === "ready" ? (
        <>
          <section className="today-panel today-page__week" aria-label="이번 주 진행" />
          <div className="today-page__grid">
            <section className="today-panel today-page__kanban" aria-label="칸반" />
            <div className="today-page__side">
              <section className="today-panel today-page__timer" aria-label="타이머" />
              <section className="today-panel today-page__summary" aria-label="오늘 요약" />
            </div>
          </div>
        </>
      ) : (
        <section className="today-panel today-page__notice-box">
          <TodayNotice kind={kind} message={message} />
        </section>
      )}
    </div>
  );
}

/** 읽는 중·읽기 실패 문구 (플랜 화면과 같은 문구) */
function TodayNotice({ kind, message }: { kind: "loading" | "error"; message: string }) {
  if (kind === "loading") return <div className="today-page__notice">불러오는 중…</div>;
  return (
    <div className="today-page__notice today-page__notice--error">
      저장된 데이터를 읽지 못했어요. 기존 파일을 지키기 위해 저장을 멈췄어요.
      <br />({message})
    </div>
  );
}

export default TodayPage;
