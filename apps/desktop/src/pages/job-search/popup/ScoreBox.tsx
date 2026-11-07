import { gradeLabel, gradeTone } from "../../../features/job-search/grade";
import { WAITING_NOTE } from "../../../features/job-search/messages";
import type { PostingDetail } from "../../../features/job-search/postingApi";

/** 채점하지 않은 공고의 칩과 설명 */
function unscored(detail: PostingDetail): { chip: string; tone: string; text: string } {
  const extracted = detail.fields !== null ? "항목 추출만 끝났어요. " : "";
  const ask = "채점하려면 아래 \"그래도 채점\"을 눌러 주세요.";
  if (detail.suspect) return { chip: "인젝션 의심", tone: "red", text: `${extracted}${ask}` };
  switch (detail.stage) {
    case "filtered1":
      return { chip: "1차 필터", tone: "", text: `필터에 걸려 채점하지 않았어요. ${ask}` };
    case "filtered2":
      return { chip: "2차 필터", tone: "blue", text: `필터에 걸려 채점하지 않았어요. ${extracted}${ask}` };
    case "waiting":
      return { chip: "채점 대기", tone: "amber", text: WAITING_NOTE };
    default:
      return { chip: "채점 전", tone: "", text: "아직 처리 순서를 기다리는 공고예요" };
  }
}

/** 점수·등급·한 줄 요약 (R10, R51). 채점 전이면 "채점 안 함"과 이유 */
function ScoreBox({ detail }: { detail: PostingDetail }) {
  const score = detail.score;
  if (!score) {
    const info = unscored(detail);
    return (
      <div className="js-popup__score js-popup__score--none">
        <div className="js-popup__num">채점 안 함</div>
        <div className="js-popup__sum">
          <span className={`js-popup__chip${info.tone ? ` js-popup__chip--${info.tone}` : ""}`}>{info.chip}</span>
          <p>{info.text}</p>
        </div>
      </div>
    );
  }
  const tone = gradeTone(score.grade);
  return (
    <div className="js-popup__score">
      <div className={`js-popup__num js-popup__num--${tone}`}>
        {score.score}
        <small>점</small>
      </div>
      <div className="js-popup__sum">
        <span className={`js-popup__chip js-popup__chip--${tone}`}>{gradeLabel(score.grade)}</span>
        {score.summary && <p>{score.summary}</p>}
      </div>
    </div>
  );
}

export default ScoreBox;
