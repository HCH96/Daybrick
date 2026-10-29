import { useEffect, useState } from "react";
import { daysLeft, ddayLabel } from "../../../features/job-search/dday";
import { gradeLabel, gradeTone } from "../../../features/job-search/grade";
import { ARCHIVED_DESC, NO_ARCHIVED, listLoadErrorMessage, restoreErrorMessage } from "../../../features/job-search/messages";
import { loadPostingList, setPostingHidden, type ListPosting } from "../../../features/job-search/postingApi";
import { shortDay } from "../../../features/job-search/postingFormat";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import type { ApiErrorKind } from "../../../features/server/management";
import type { StatusLine } from "../profile/profileFormat";
import { UndoIcon } from "../popup/PopupIcons";
import ListHead from "./ListHead";
import "./ArchivedList.css";

interface ArchivedListProps {
  /** 바뀌면 목록을 다시 읽는다 (팝업에서 바꾼 뒤) */
  refreshKey: number;
  onOpen: (id: string) => void;
  onChanged: () => void;
}

function subLine(p: ListPosting, expired: boolean) {
  const parts = [p.siteName, p.experience, p.employment.join(", ") || null, p.location].filter(
    (s): s is string => s !== null,
  );
  return (
    <div className="js-list__sub">
      {parts.join(" · ")}
      {p.score !== null && p.grade !== null && (
        <>
          {parts.length > 0 && " · "}
          <span className={`js-list__g--${gradeTone(p.grade)}`}>
            {p.score}점 {gradeLabel(p.grade)}
          </span>
        </>
      )}
      {expired && <span className="js-list__faint"> · 마감 지남</span>}
    </div>
  );
}

/** 지원 안 함 보관함 (R15, R16): 보관한 공고와 [되돌리기]. 마감 지난 공고는 남겨 두되 되돌리기를 끈다 */
function ArchivedList({ refreshKey, onOpen, onChanged }: ArchivedListProps) {
  const { session } = useJobSearch();
  const [list, setList] = useState<ListPosting[] | null>(null);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusLine>(null);

  useEffect(() => {
    let alive = true;
    void loadPostingList(session, "archived").then((r) => {
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

  async function restore(id: string) {
    setBusyId(id);
    setStatus(null);
    const result = await setPostingHidden(session, id, false);
    setBusyId(null);
    if (!result.ok) setStatus({ ok: false, text: restoreErrorMessage(result.error) });
    else onChanged();
  }

  const now = new Date();
  return (
    <div className="js-list">
      <ListHead title="지원 안 함 보관함" count={list?.length ?? 0} desc={ARCHIVED_DESC} />
      {status && (
        <p className="js-list__msg js-list__msg--bad" role="status">
          {status.text}
        </p>
      )}
      {!list ? (
        <p className="js-list__empty">{loadError ? listLoadErrorMessage(loadError) : "목록을 읽는 중…"}</p>
      ) : list.length === 0 ? (
        <p className="js-list__empty">{NO_ARCHIVED}</p>
      ) : (
        <div className="js-list__rows">
          {list.map((p) => {
            const days = daysLeft(p.deadlineDate, now);
            const expired = days !== null && days < 0;
            return (
              <div
                key={p.id}
                className="js-list__row"
                role="button"
                tabIndex={0}
                onClick={() => onOpen(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target === e.currentTarget) onOpen(p.id);
                }}
              >
                <div className="js-list__main">
                  <div className="js-list__title">
                    <span className="js-list__co">{p.company ?? "회사 없음"}</span>
                    {p.title ?? "제목 없음"}
                  </div>
                  {subLine(p, expired)}
                </div>
                <span className="js-list__when">
                  {p.hiddenAt ? `${shortDay(p.hiddenAt)} 보관` : "보관"} · {expired ? "마감" : ddayLabel(days).text}
                </span>
                <button
                  type="button"
                  className="setup-btn setup-btn--sm"
                  disabled={expired || busyId !== null}
                  onClick={(e) => {
                    e.stopPropagation();
                    void restore(p.id);
                  }}
                >
                  <UndoIcon />
                  {busyId === p.id ? "되돌리는 중…" : "되돌리기"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ArchivedList;
