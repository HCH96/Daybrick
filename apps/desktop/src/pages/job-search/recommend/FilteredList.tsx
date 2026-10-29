import { useEffect, useMemo, useState } from "react";
import SegmentedControl, { type SegmentOption } from "../../../components/common/SegmentedControl";
import { daysLeft, ddayLabel } from "../../../features/job-search/dday";
import {
  FILTERED_DESC,
  FORCE_SCORING,
  NO_FILTERED,
  forceCallErrorMessage,
  forceDoneMessage,
  forceFailMessage,
  listLoadErrorMessage,
} from "../../../features/job-search/messages";
import { forceScore, loadPostingList, type ListPosting } from "../../../features/job-search/postingApi";
import { failLabel, hitLabel, hitStage, matchesStage, shortDay, type FilteredStage } from "../../../features/job-search/postingFormat";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import type { ApiErrorKind } from "../../../features/server/management";
import type { StatusLine } from "../profile/profileFormat";
import { AlertIcon } from "./RecommendIcons";
import { SparkIcon } from "../popup/PopupIcons";
import ListHead from "./ListHead";
import SourceNames from "./SourceNames";
import "./ArchivedList.css";

interface FilteredListProps {
  /** 바뀌면 목록을 다시 읽는다 (팝업에서 바꾼 뒤) */
  refreshKey: number;
  onOpen: (id: string) => void;
  onChanged: () => void;
}

interface Row {
  posting: ListPosting;
  days: number | null;
}

function Hits({ posting }: { posting: ListPosting }) {
  return (
    <div className="js-list__why">
      {posting.stage === "suspect" && (
        <span className="js-list__chip js-list__chip--red">
          <AlertIcon />
          인젝션 의심
        </span>
      )}
      {posting.stage === "failed" && (
        <span className="js-list__chip js-list__chip--red" title={posting.failReason ?? undefined}>
          <AlertIcon />
          처리 실패 · {failLabel(posting.failReason ?? "")}
        </span>
      )}
      {posting.hits.map((h, i) => (
        <span key={i} className={`js-list__chip${hitStage(h) === 2 ? " js-list__chip--blue" : ""}`}>
          {hitLabel(h)}
        </span>
      ))}
    </div>
  );
}

/** 걸러진 공고 목록 (R46, R49): 단계 고르기, 걸린 조건 칩, 줄마다 [그래도 채점], 줄을 누르면 팝업 */
function FilteredList({ refreshKey, onOpen, onChanged }: FilteredListProps) {
  const { session } = useJobSearch();
  const [list, setList] = useState<ListPosting[] | null>(null);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [stage, setStage] = useState<FilteredStage>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusLine>(null);

  useEffect(() => {
    let alive = true;
    void loadPostingList(session, "filtered").then((r) => {
      if (!alive) return;
      if (r.ok) {
        setList(r.value);
        setLoadError(null);
      } else setLoadError(r.error);
    });
    return () => {
      alive = false;
    };
  }, [session, refreshKey]);

  // 마감이 지난 공고는 빠진다 (목업 filtered.html)
  const rows = useMemo<Row[]>(() => {
    const now = new Date();
    return (list ?? [])
      .map((posting) => ({ posting, days: daysLeft(posting.deadlineDate, now) }))
      .filter((r) => r.days === null || r.days >= 0);
  }, [list]);
  const shown = rows.filter((r) => matchesStage(r.posting.stage, stage));
  const count = (s: FilteredStage) => rows.filter((r) => matchesStage(r.posting.stage, s)).length;
  const options: SegmentOption<FilteredStage>[] = [
    { value: "all", label: "전체", count: count("all") },
    { value: "filtered1", label: "1차 필터", count: count("filtered1") },
    { value: "filtered2", label: "2차 필터", count: count("filtered2") },
    { value: "suspect", label: "인젝션 의심", count: count("suspect") },
    { value: "failed", label: "처리 실패", count: count("failed") },
  ];

  async function force(id: string) {
    setBusyId(id);
    setStatus({ ok: true, text: FORCE_SCORING });
    const result = await forceScore(session, id);
    if (!result.ok) setStatus({ ok: false, text: forceCallErrorMessage(result.error) });
    else if (!result.value.ok) setStatus({ ok: false, text: forceFailMessage(result.value) });
    else {
      setStatus({ ok: true, text: forceDoneMessage(result.value.stage) });
      onChanged();
    }
    setBusyId(null);
  }

  return (
    <div className="js-list">
      <ListHead title="걸러진 공고" count={rows.length} desc={FILTERED_DESC} />
      <div className="js-list__seg">
        <SegmentedControl options={options} value={stage} onChange={setStage} ariaLabel="걸린 단계" />
      </div>
      {status && (
        <p className={`js-list__msg js-list__msg--${status.ok ? "ok" : "bad"}`} role="status">
          {status.text}
        </p>
      )}
      {!list ? (
        <p className="js-list__empty">{loadError ? listLoadErrorMessage(loadError) : "목록을 읽는 중…"}</p>
      ) : shown.length === 0 ? (
        <p className="js-list__empty">{NO_FILTERED}</p>
      ) : (
        <div className="js-list__rows">
          {shown.map(({ posting, days }) => (
            <div
              key={posting.id}
              className="js-list__row"
              role="button"
              tabIndex={0}
              onClick={() => onOpen(posting.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target === e.currentTarget) onOpen(posting.id);
              }}
            >
              <div className="js-list__main">
                <div className="js-list__title">
                  <span className="js-list__co">{posting.company ?? "회사 없음"}</span>
                  {posting.title ?? "제목 없음"}
                </div>
                <SourceNames sources={posting.sources} className="js-list__src" />
                <Hits posting={posting} />
                {posting.stage === "suspect" &&
                  posting.suspectQuotes.map((q, i) => (
                    <div key={i} className="js-list__quote">
                      “{q}”
                    </div>
                  ))}
              </div>
              <span className="js-list__when">
                {shortDay(posting.collectedAt)} · {ddayLabel(days).text}
              </span>
              <button
                type="button"
                className="setup-btn setup-btn--sm"
                disabled={busyId !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  void force(posting.id);
                }}
              >
                <SparkIcon />
                {busyId === posting.id ? "채점하는 중…" : "그래도 채점"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilteredList;
