import { NOT_COLLECTED_YET, WAITING_NOTE } from "../../../features/job-search/messages";
import { AlertIcon, ClockIcon } from "./RecommendIcons";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 10/26 (월) 06:00 */
function formatCollectTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]}) ${hh}:${mm}`;
}

interface CollectStatusLineProps {
  lastCollectAt: string | null;
  failedSites: number;
  waiting: number;
}

/** 추천 공고 탭 상태 상자의 2줄 (R6, R7): 마지막 수집 시각, 수집 실패 N곳(빨강), 채점 대기 N개(주황) */
function CollectStatusLine({ lastCollectAt, failedSites, waiting }: CollectStatusLineProps) {
  return (
    <div className="js-recommend__status-row">
      <span className="js-recommend__status-item">
        <ClockIcon />
        마지막 수집 <b>{lastCollectAt ? formatCollectTime(lastCollectAt) : NOT_COLLECTED_YET}</b>
      </span>
      {(failedSites > 0 || waiting > 0) && <span className="js-recommend__dot-sep">·</span>}
      {failedSites > 0 && (
        <span className="js-recommend__chip js-recommend__chip--red">
          <AlertIcon />
          수집 실패 {failedSites}곳
        </span>
      )}
      {waiting > 0 && (
        <>
          <span className="js-recommend__chip js-recommend__chip--amber">
            <ClockIcon />
            채점 대기 {waiting}개
          </span>
          <span className="js-recommend__faint">{WAITING_NOTE}</span>
        </>
      )}
    </div>
  );
}

export default CollectStatusLine;
