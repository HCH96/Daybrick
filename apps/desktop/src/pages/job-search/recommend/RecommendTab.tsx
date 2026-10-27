import { useCallback, useEffect, useMemo, useState } from "react";
import {
  NO_RECOMMEND,
  recommendLoadErrorMessage,
  rescoreCallErrorMessage,
  rescoredMessage,
  rescoreStopMessage,
} from "../../../features/job-search/messages";
import { loadRecommend, rescoreOnce, type RecommendState } from "../../../features/job-search/recommendApi";
import { sortPostings, type RecommendSort } from "../../../features/job-search/sortPostings";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import type { ApiErrorKind } from "../../../features/server/management";
import "../../server-setup/wizard/WizardShell.css";
import type { StatusLine } from "../profile/profileFormat";
import CollectStatusLine from "./CollectStatusLine";
import PostingGrid from "./PostingGrid";
import RecommendToolbar from "./RecommendToolbar";
import UsageLine from "./UsageLine";
import { useOpenedAt } from "./useOpenedAt";
import "./RecommendTab.css";

/** 다시 채점을 이어 부르는 최대 횟수 (한 번에 최대 10개, 시간 한도로 끊기면 이어 부른다) */
const MAX_RESCORE_CALLS = 20;

/** 추천 공고 탭 (R4–R8, R23, R75): 상태 상자(사용액·수집 상태), 도구 줄, 카드 3열 */
function RecommendTab() {
  const { session, data: shared, refresh } = useJobSearch();
  const openedAt = useOpenedAt();
  const [data, setData] = useState<RecommendState | null>(null);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [sort, setSort] = useState<RecommendSort>("score");
  const [rescoring, setRescoring] = useState(false);
  const [status, setStatus] = useState<StatusLine>(null);

  const reload = useCallback(async (): Promise<ApiErrorKind | null> => {
    const result = await loadRecommend(session);
    if (!result.ok) return result.error;
    setData(result.value);
    return null;
  }, [session]);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    setLoadError(await reload());
  }, [reload]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const profileVersion = shared?.settings.profileVersion ?? 0;
  const items = useMemo(() => (data ? sortPostings(data.postings, sort, new Date()) : []), [data, sort]);
  const staleCount = items.filter((i) => i.posting.profileVersion < profileVersion).length;

  /** 이전 프로필 기준 점수를 모두 다시 채점한다 (R23, D37 rescore). 시간 한도로 끊기면 이어 부른다 */
  async function rescore() {
    setRescoring(true);
    setStatus(null);
    let done = 0;
    let line: StatusLine = null;
    for (let i = 0; i < MAX_RESCORE_CALLS && line === null; i++) {
      const result = await rescoreOnce(session);
      if (!result.ok) {
        line = { ok: false, text: rescoreCallErrorMessage(result.error) };
        break;
      }
      const { stopped, remaining } = result.value;
      done += result.value.done;
      if (remaining === 0) line = { ok: true, text: rescoredMessage(done) };
      else if (stopped && stopped.reason !== "time") line = { ok: false, text: rescoreStopMessage(stopped, done, remaining) };
      else if (!stopped && result.value.done === 0) line = { ok: false, text: rescoreStopMessage({ reason: "upstream" }, done, remaining) };
      else if (i === MAX_RESCORE_CALLS - 1) line = { ok: false, text: rescoreStopMessage({ reason: "time" }, done, remaining) };
    }
    const failed = await reload();
    await refresh();
    setStatus(failed ? { ok: false, text: recommendLoadErrorMessage(failed) } : line);
    setRescoring(false);
  }

  return (
    <div className="js-recommend">
      <div className="js-recommend__status">
        <UsageLine />
        {data && (
          <CollectStatusLine lastCollectAt={data.lastCollectAt} failedSites={data.failedSites} waiting={data.waiting} />
        )}
      </div>

      {!data ? (
        <div className="js-recommend__state">
          {loadError ? recommendLoadErrorMessage(loadError) : "추천 공고를 읽는 중…"}
          {loadError && (
            <button type="button" className="setup-btn" onClick={() => void loadAll()}>
              다시 시도
            </button>
          )}
        </div>
      ) : (
        <>
          <RecommendToolbar
            sort={sort}
            onSort={setSort}
            count={items.length}
            staleCount={staleCount}
            rescoring={rescoring}
            onRescore={() => void rescore()}
            archived={data.archived}
            filtered={data.filtered}
          />
          {status && (
            <p className={`js-recommend__msg js-recommend__msg--${status.ok ? "ok" : "bad"}`} role="status">
              {status.text}
            </p>
          )}
          {items.length === 0 ? (
            <p className="js-recommend__empty">{NO_RECOMMEND}</p>
          ) : (
            <PostingGrid items={items} newSince={openedAt} profileVersion={profileVersion} />
          )}
        </>
      )}
    </div>
  );
}

export default RecommendTab;
