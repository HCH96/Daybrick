import { useCallback, useEffect, useState } from "react";
import {
  CONTINUE_BATCH,
  continueEtaMinutes,
  continueRunning,
  hhmm,
  lastContinueAt,
  nextContinueAt,
} from "../../../features/job-search/cronSlots";
import { loadProcessState, type ProcessState } from "../../../features/job-search/processApi";
import {
  PROCESS_NOTHING,
  etaText,
  pauseText,
  processStateErrorMessage,
} from "../../../features/job-search/processMessages";
import type { RunState } from "../../../features/job-search/processRun";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import type { ApiErrorKind } from "../../../features/server/management";
import { ClockIcon } from "../recommend/RecommendIcons";
import { PlayIcon } from "../sources/SourcesIcons";
import "./ProcessStatusLine.css";

/** 처리 상태를 다시 읽는 간격. 다음 예약 시각 표시도 이때 바뀐다 */
const TICK_MS = 30_000;

interface ProcessStatusLineProps {
  /** 바뀌면 처리 상태를 다시 읽는다 (수집을 마친 뒤 등) */
  refreshKey?: number;
}

function RunningText({ state }: { state: Exclude<RunState, { kind: "idle" }> }) {
  if (state.kind === "bodies") {
    return (
      <span className="js-process__text">
        <b>원문 받는 중</b> · 남은 원문 {state.pending}개
      </span>
    );
  }
  const progress = state.done > 0 || state.remaining > 0 ? ` · 이번에 ${state.done}개 끝 · 남은 ${state.remaining}개` : "";
  if (state.kind === "pause") {
    return (
      <span className="js-process__text">
        {pauseText(state.until)}
        {progress}
      </span>
    );
  }
  return (
    <span className="js-process__text">
      <b>평가 중</b>
      {progress}
    </span>
  );
}

function IdleText({ value, now }: { value: ProcessState; now: Date }) {
  if (value.queue === 0 && value.bodies === 0) {
    return <span className="js-process__text">{PROCESS_NOTHING}</span>;
  }
  const running = continueRunning(now);
  const total = value.queue + value.bodies;
  return (
    <>
      {running ? (
        <span className="js-process__chip js-process__chip--accent">
          예약 처리 중 ({hhmm(lastContinueAt(now))} 시작)
        </span>
      ) : (
        <span className="js-process__chip">평가 대기 {value.queue}개</span>
      )}
      {value.bodies > 0 && <span className="js-process__chip">원문 대기 {value.bodies}개</span>}
      <span className="js-process__text">
        다음 예약 처리 <b>{hhmm(nextContinueAt(now))}</b>
        <span className="js-process__faint">
          {" "}
          · 15분마다 {CONTINUE_BATCH}개씩, 다 끝나기까지 {etaText(continueEtaMinutes(total))}
        </span>
      </span>
    </>
  );
}

/**
 * 처리 상태 줄 (사용자 테스트 r1 추가 요청 3·5): 앱이 평가 중인지, 예약 처리 중·대기 중인지,
 * 다음 예약 처리 시각을 보여 주고 [지금 평가]·[멈추기]를 둔다.
 */
function ProcessStatusLine({ refreshKey = 0 }: ProcessStatusLineProps) {
  const { session, runner } = useJobSearch();
  const [value, setValue] = useState<ProcessState | null>(null);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    const result = await loadProcessState(session);
    setNow(new Date());
    if (result.ok) {
      setValue(result.value);
      setLoadError(null);
    } else setLoadError(result.error);
  }, [session]);

  useEffect(() => {
    void load();
  }, [load, refreshKey, runner.version]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), TICK_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const busy = runner.state.kind !== "idle";
  const hasWork = value !== null && value.queue + value.bodies > 0;

  return (
    <div className="js-process">
      <div className="js-process__row">
        {busy ? (
          <span className="js-process__spinner" aria-hidden="true" />
        ) : (
          <span className="js-process__icon">
            <ClockIcon />
          </span>
        )}
        <span className="js-process__k">처리</span>
        {runner.state.kind !== "idle" ? (
          <RunningText state={runner.state} />
        ) : value ? (
          <IdleText value={value} now={now} />
        ) : (
          <span className="js-process__text">
            {loadError ? processStateErrorMessage(loadError) : "처리 상태를 읽는 중…"}
          </span>
        )}
        <span className="js-process__right">
          {busy ? (
            <button type="button" className="setup-btn setup-btn--sm" onClick={runner.stop}>
              멈추기
            </button>
          ) : (
            hasWork && (
              <button type="button" className="setup-btn setup-btn--sm setup-btn--primary" onClick={runner.start}>
                <PlayIcon />
                지금 평가
              </button>
            )
          )}
        </span>
      </div>
      {!busy && runner.result && (
        <p className={`js-process__msg js-process__msg--${runner.result.ok ? "ok" : "bad"}`} role="status">
          {runner.result.text}
        </p>
      )}
    </div>
  );
}

export default ProcessStatusLine;
