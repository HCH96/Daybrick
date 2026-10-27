import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import {
  deleteSite,
  loadSources,
  runCollect,
  setSiteEnabled,
  type SourcesState,
} from "../../../features/job-search/api";
import {
  COLLECTING,
  NO_SITES,
  collectCallErrorMessage,
  collectDoneMessage,
  collectFailMessage,
  siteDeleteErrorMessage,
  siteToggleErrorMessage,
  sourcesLoadErrorMessage,
} from "../../../features/job-search/messages";
import type { Adapter, Site } from "../../../features/job-search/types";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import type { ApiErrorKind } from "../../../features/server/management";
import "../../server-setup/wizard/WizardShell.css";
import type { StatusLine } from "../profile/profileFormat";
import AdapterCards from "./AdapterCards";
import SiteTable from "./SiteTable";
import { BookIcon, PlayIcon } from "./SourcesIcons";
import "./SourcesTab.css";

/** 수집 사이트 탭 (R24, R31, R34): 위쪽 단추 줄, 사이트 표, 어댑터 카드 */
function SourcesTab() {
  const { session } = useJobSearch();
  const [data, setData] = useState<SourcesState | null>(null);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [collecting, setCollecting] = useState(false);
  const [status, setStatus] = useState<StatusLine>(null);

  /** 기본 사이트를 맞추고 표를 다시 읽는다. 실패하면 원인을 돌려준다 */
  const reload = useCallback(async (): Promise<ApiErrorKind | null> => {
    const result = await loadSources(session);
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

  const adapterById = useMemo(
    () => new Map<string, Adapter>((data?.adapters ?? []).map((a) => [a.id, a])),
    [data],
  );
  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const site of data?.sites ?? []) {
      if (site.adapterId) counts.set(site.adapterId, (counts.get(site.adapterId) ?? 0) + 1);
    }
    return counts;
  }, [data]);

  async function toggle(site: Site) {
    setBusyId(site.id);
    setStatus(null);
    const result = await setSiteEnabled(session, site.id, !site.enabled);
    if (!result.ok) setStatus({ ok: false, text: siteToggleErrorMessage(result.error) });
    const failed = await reload();
    if (result.ok && failed) setStatus({ ok: false, text: sourcesLoadErrorMessage(failed) });
    setBusyId(null);
  }

  async function remove(site: Site) {
    setBusyId(site.id);
    setStatus(null);
    const result = await deleteSite(session, site.id);
    if (!result.ok) setStatus({ ok: false, text: siteDeleteErrorMessage(result.error) });
    const failed = await reload();
    if (result.ok && failed) setStatus({ ok: false, text: sourcesLoadErrorMessage(failed) });
    setBusyId(null);
  }

  async function collect() {
    setCollecting(true);
    setStatus(null);
    const result = await runCollect(session);
    let line: StatusLine;
    if (!result.ok) {
      line = { ok: false, text: collectCallErrorMessage(result.error) };
    } else if (!result.value.ok) {
      line = { ok: false, text: collectFailMessage(result.value.reason) };
    } else {
      const { sites, pending } = result.value;
      const added = sites.reduce((sum, s) => sum + s.added, 0);
      const failed = sites.filter((s) => !s.ok).length;
      line = { ok: failed === 0, text: collectDoneMessage(added, failed, pending) };
    }
    // 실패해도 사이트별 결과·시각이 바뀌었을 수 있으니 표를 다시 읽는다
    const loadFailed = await reload();
    setStatus(loadFailed && line.ok ? { ok: false, text: sourcesLoadErrorMessage(loadFailed) } : line);
    setCollecting(false);
  }

  if (!data) {
    return (
      <div className="js-sources__state">
        {loadError ? sourcesLoadErrorMessage(loadError) : "수집 사이트를 읽는 중…"}
        {loadError && (
          <button type="button" className="setup-btn" onClick={() => void loadAll()}>
            다시 시도
          </button>
        )}
      </div>
    );
  }

  const enabledCount = data.sites.filter((s) => s.enabled).length;

  return (
    <div className="js-sources">
      <div className="js-sources__bar">
        {collecting && (
          <span className="js-sources__msg" role="status">
            {COLLECTING}
          </span>
        )}
        {!collecting && status && (
          <span className={`js-sources__msg js-sources__msg--${status.ok ? "ok" : "bad"}`} role="status">
            {status.text}
          </span>
        )}
        <div className="js-sources__actions">
          {/* 가이드·사이트 추가 창은 7단계에서 연결한다 */}
          <button type="button" className="setup-btn" disabled>
            <BookIcon />
            어댑터 가이드
          </button>
          <button
            type="button"
            className="setup-btn"
            disabled={collecting || busyId !== null || enabledCount === 0}
            aria-busy={collecting}
            onClick={() => void collect()}
          >
            {collecting ? <span className="js-sources__spinner" aria-hidden="true" /> : <PlayIcon />}
            {collecting ? "수집 중…" : "지금 수집"}
          </button>
          <button type="button" className="setup-btn setup-btn--primary" disabled>
            <PlusIcon size={14} />
            사이트 추가
          </button>
        </div>
      </div>

      {data.sites.length === 0 ? (
        <p className="js-sources__empty">{NO_SITES}</p>
      ) : (
        <SiteTable
          sites={data.sites}
          adapters={adapterById}
          usage={usage}
          busyId={busyId}
          disabled={collecting}
          onToggle={(site) => void toggle(site)}
          onDelete={(site) => void remove(site)}
        />
      )}

      <AdapterCards adapters={data.adapters} sites={data.sites} usage={usage} />
    </div>
  );
}

export default SourcesTab;
