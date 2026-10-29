import { useCallback, useEffect, useState } from "react";
import {
  addFilter,
  deleteFilter,
  loadFilters,
  loadFlowPostings,
  loadProfileState,
  refilter,
  setFilterEnabled,
} from "../../../features/job-search/api";
import {
  FIRST_KINDS,
  SECOND_KINDS,
  KIND_INFO,
  isAddableKind,
  kstWeekStart,
  summarizeFlow,
  type AddableKind,
  type FlowCounts,
} from "../../../features/job-search/filterRules";
import {
  FILTER_FOOT_NOTE,
  filterChangeErrorMessage,
  filtersLoadErrorMessage,
  flowLoadErrorMessage,
  refilterErrorMessage,
  refilteredMessage,
} from "../../../features/job-search/messages";
import type { FilterRule } from "../../../features/job-search/types";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import type { ApiErrorKind, ApiResult } from "../../../features/server/management";
import "../../server-setup/wizard/WizardShell.css";
import type { StatusLine } from "../profile/profileFormat";
import { AlertIcon } from "../sources/SourcesIcons";
import FilterPanel, { FilterSwitch } from "./FilterPanel";
import FlowLine from "./FlowLine";
import "./FiltersTab.css";

/** 저장된 프로필 기술스택 요약 (자동 추림 줄 설명) */
interface ProfileSkills {
  version: number;
  names: string[];
}

function skillsSummary(profile: ProfileSkills | null): string {
  const base = "프로필 기술스택과 하나도 겹치지 않으면 거름";
  if (!profile) return `${base} (저장된 프로필이 없어 지금은 거르지 않아요)`;
  if (profile.names.length === 0) return `${base} (프로필 v${profile.version}에 기술스택이 없어 지금은 거르지 않아요)`;
  const shown = profile.names.slice(0, 3).join(", ");
  const rest = profile.names.length - 3;
  return `${base} (프로필 v${profile.version}: ${shown}${rest > 0 ? ` 외 ${rest}개` : ""})`;
}

/** 필터 탭 (R41–R47, R96, R98): 처리 순서 줄, 1차·2차 필터 판 */
function FiltersTab() {
  const { session } = useJobSearch();
  const [rules, setRules] = useState<FilterRule[] | null>(null);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [flow, setFlow] = useState<FlowCounts | null>(null);
  const [profile, setProfile] = useState<ProfileSkills | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<StatusLine>(null);

  const reloadRules = useCallback(async (): Promise<ApiErrorKind | null> => {
    const result = await loadFilters(session);
    if (!result.ok) return result.error;
    setRules(result.value);
    return null;
  }, [session]);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    setStatus(null);
    const [ruleError, flowResult, profileResult] = await Promise.all([
      reloadRules(),
      loadFlowPostings(session, kstWeekStart(new Date()).toISOString()),
      loadProfileState(session),
    ]);
    setLoadError(ruleError);
    if (flowResult.ok) setFlow(summarizeFlow(flowResult.value));
    else setStatus({ ok: false, text: flowLoadErrorMessage(flowResult.error) });
    if (profileResult.ok && profileResult.value.latest) {
      const latest = profileResult.value.latest;
      setProfile({ version: latest.version, names: latest.data.skills.items.map((s) => s.name) });
    }
  }, [reloadRules, session]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  /** 조건을 바꾸고, 성공하면 채점 전 공고를 되돌린 뒤(R47) 목록을 다시 읽는다 */
  async function change(run: () => Promise<ApiResult<null>>): Promise<boolean> {
    setBusy(true);
    setStatus(null);
    const result = await run();
    let line: StatusLine;
    if (!result.ok) {
      line = { ok: false, text: filterChangeErrorMessage(result.error) };
    } else {
      const reset = await refilter(session);
      line = reset.ok ? { ok: true, text: refilteredMessage(reset.value) } : { ok: false, text: refilterErrorMessage(reset.error) };
    }
    const failed = await reloadRules();
    setStatus(failed && line.ok ? { ok: false, text: filtersLoadErrorMessage(failed) } : line);
    setBusy(false);
    return result.ok;
  }

  const toggle = (rule: FilterRule) => void change(() => setFilterEnabled(session, rule.id, !rule.enabled));
  const remove = (rule: FilterRule) => void change(() => deleteFilter(session, rule.id));
  const add = (kind: AddableKind, value: unknown) =>
    change(() => addFilter(session, { stage: KIND_INFO[kind].stage, kind, value }));

  if (!rules) {
    return (
      <div className="js-filters__state">
        {loadError ? filtersLoadErrorMessage(loadError) : "필터를 읽는 중…"}
        {loadError && (
          <button type="button" className="setup-btn" onClick={() => void loadAll()}>
            다시 시도
          </button>
        )}
      </div>
    );
  }

  const overlap = rules.find((r) => r.kind === "skill-overlap") ?? null;
  const devOnly = rules.find((r) => r.kind === "dev-only") ?? null;
  const first = rules.filter((r) => r.stage === 1 && isAddableKind(r.kind));
  const second = rules.filter((r) => r.stage === 2 && isAddableKind(r.kind));

  return (
    <div className="js-filters">
      <FlowLine counts={flow} />
      {status && (
        <p className={`js-filters__msg js-filters__msg--${status.ok ? "ok" : "bad"}`} role="status">
          {status.text}
        </p>
      )}
      <div className="js-filters__grid">
        <FilterPanel
          title="1차 필터"
          tag="AI 없음"
          desc="목록에 보이는 제목·회사·직무로 거릅니다. 걸러진 공고는 AI를 쓰지 않아요."
          rules={first}
          kinds={FIRST_KINDS}
          disabled={busy}
          onToggle={toggle}
          onDelete={remove}
          onAdd={add}
        />
        <FilterPanel
          title="2차 필터"
          tag="AI 없음 · 추출 항목 사용"
          desc="항목 추출이 끝난 공고를 직군·기술스택·경력·고용 형태로 거릅니다."
          rules={second}
          kinds={SECOND_KINDS}
          disabled={busy}
          onToggle={toggle}
          onDelete={remove}
          onAdd={add}
          top={
            <>
              {devOnly && (
                <FilterSwitch
                  rule={devOnly}
                  title="개발 직군만"
                  desc="직군이 개발·판단 불가인 공고만 통과 (이미 채점한 공고에도 적용)"
                  disabled={busy}
                  onToggle={toggle}
                />
              )}
              {overlap && (
                <FilterSwitch
                  rule={overlap}
                  title="기술스택 자동 추림"
                  desc={skillsSummary(profile)}
                  disabled={busy}
                  onToggle={toggle}
                />
              )}
            </>
          }
        />
      </div>
      <div className="js-filters__foot">
        <AlertIcon />
        {FILTER_FOOT_NOTE}
      </div>
    </div>
  );
}

export default FiltersTab;
