import { useEffect, useState } from "react";
import { SmallCheckIcon } from "../icons/CommonIcons";
import { ArrowRightIcon, ArrowUpIcon } from "../icons/ServerIcons";
import { useServerUpdateRun, useSchemaPair, type SchemaPair } from "../../features/server/serverUpdate";
import type { ServerSession } from "../../features/server/session";
import { useServer } from "../../features/server/useServer";
import { parseSupabaseUrl } from "../../features/server/validate";
import { FIELD_HELPS } from "../../pages/server-setup/wizard/guides";
import HelpToggle from "../../pages/server-setup/wizard/HelpToggle";
import RunStepList from "../../pages/server-setup/wizard/RunStepList";
import SecretInput from "../../pages/server-setup/wizard/SecretInput";
import "../../pages/server-setup/wizard/WizardShell.css";
import "../../pages/server-setup/wizard/WizardFields.css";
import "../../pages/server-setup/wizard/SetupRunStep.css";
import "./ServerUpdateScreen.css";

/** 번호를 모르면 "?" */
function schemaText(value: number | null | undefined): string {
  if (value === undefined) return "?";
  return String(value ?? 0);
}

/** "추가되는 것": 빠진 번호 범위와 서버 함수 재배포 */
function ChangeList({ pair }: { pair: SchemaPair | null }) {
  const server = pair?.server;
  const from = typeof server === "number" ? server + 1 : server === null ? 1 : null;
  const to = pair?.app ?? null;
  let schemaLine = "앱이 가진 서버 구조 중 서버에 없는 번호 (테이블·접근 규칙)";
  if (from !== null && to !== null && from <= to) {
    schemaLine = from === to ? `${to}번 서버 구조 (테이블·접근 규칙)` : `${from}번 ~ ${to}번 서버 구조 (테이블·접근 규칙)`;
  }
  return (
    <div className="change-list">
      <b>추가되는 것</b>
      <ul>
        {from !== null && to !== null && from > to ? null : <li>{schemaLine}</li>}
        <li>앱이 가진 서버 함수 다시 배포</li>
      </ul>
      <div className="change-list__note">기존 데이터는 지우거나 바꾸지 않습니다.</div>
    </div>
  );
}

export interface ServerUpdatePanelProps {
  url: string;
  anonKey: string;
  /** 마무리 확인(health)에 쓰는 로그인 세션 */
  session: ServerSession | null;
  /** [나중에]: 이전 화면으로 (서버 기능은 계속 막힘) */
  onLater: () => void;
  /** 업데이트를 마치고 [확인] */
  onDone: () => void;
  /** 업데이트가 끝난 순간 (상태 다시 확인, 띠 지우기) */
  onUpdated?: () => void;
  /** 실행 중인지 알린다 (마법사가 [취소]·[이전]을 막을 때) */
  onRunningChange?: (running: boolean) => void;
  /** 마법사 안에 넣을 때 */
  embedded?: boolean;
}

/**
 * 서버 업데이트 (R23, R25, R26): 서버/앱 번호, PAT 칸, [업데이트], 단계 목록.
 * [업데이트]를 누르면 PAT 칸을 비우고(값은 실행에만 씀) 단계 목록을 보여준다. 끝나면 PAT를 버린다.
 */
export function ServerUpdatePanel({
  url,
  anonKey,
  session,
  onLater,
  onDone,
  onUpdated,
  onRunningChange,
  embedded = false,
}: ServerUpdatePanelProps) {
  const pair = useSchemaPair(url, anonKey);
  const run = useServerUpdateRun();
  const [pat, setPat] = useState("");
  const [started, setStarted] = useState(false);
  const projectRef = parseSupabaseUrl(url)?.ref ?? null;

  useEffect(() => {
    onRunningChange?.(run.running);
  }, [run.running, onRunningChange]);

  useEffect(() => {
    if (run.outcome === "done") onUpdated?.();
  }, [run.outcome, onUpdated]);

  const canStart = pat.trim() !== "" && projectRef !== null && pair !== null;
  const start = () => {
    if (!canStart || !projectRef || !pair) return;
    run.start({ pat: pat.trim(), projectRef, appSchema: pair.app, session });
    setPat("");
    setStarted(true);
  };

  return (
    <div className={embedded ? "server-update server-update--embedded" : "server-update"}>
      <div className="server-update__wrap">
        <h2>서버 업데이트</h2>
        <p className="server-update__desc">
          새 버전 앱이 쓰는 테이블과 서버 함수를 서버에 추가합니다. 끝날 때까지 서버 기능은 잠시 멈추고, 로컬
          기능은 그대로 쓸 수 있습니다.
        </p>
        <div className="ver-flow">
          <div className="ver-box">
            <small>지금 서버</small>
            <b>{pair ? schemaText(pair.server) : "…"}</b>
          </div>
          <span className="ver-flow__arrow">
            <ArrowRightIcon size={22} />
          </span>
          <div className="ver-box ver-box--target">
            <small>앱이 필요한 구조</small>
            <b>{pair ? pair.app : "…"}</b>
          </div>
        </div>
        <ChangeList pair={pair} />

        {!started && (
          <>
            <div className="wiz-field">
              <label className="wiz-field__label" htmlFor="server-update-pat">
                Supabase PAT
              </label>
              <SecretInput id="server-update-pat" value={pat} onChange={setPat} placeholder="sbp_…" onEnter={start} />
              <span className="wiz-field__note">업데이트가 끝나면 버립니다. 저장하지 않습니다.</span>
              <HelpToggle help={FIELD_HELPS.pat} />
            </div>
            <div className="update-foot">
              <button type="button" className="setup-btn setup-btn--ghost" onClick={onLater}>
                나중에
              </button>
              <button type="button" className="setup-btn setup-btn--primary" disabled={!canStart} onClick={start}>
                <ArrowUpIcon size={15} />
                업데이트
              </button>
            </div>
          </>
        )}

        {started && (
          <RunStepList
            progress={run.progress}
            onRetry={run.retry}
            onCancel={onLater}
            flow="update"
            cancelLabel="나중에"
          />
        )}

        {run.outcome === "done" && (
          <>
            <div className="wiz-alert wiz-alert--ok" role="status">
              <span className="wiz-alert__icon">
                <SmallCheckIcon size={18} />
              </span>
              <div>
                <b>서버 업데이트를 마쳤습니다</b>
                <p>서버 기능을 다시 쓸 수 있습니다. 입력한 PAT는 버렸습니다.</p>
              </div>
            </div>
            <div className="update-foot">
              <button type="button" className="setup-btn setup-btn--primary" onClick={onDone}>
                확인
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** 본문 자리의 서버 업데이트 화면 ("서버 업데이트가 필요합니다" 띠에서 열림). 사이드바는 그대로다. */
function ServerUpdateScreen() {
  const { config, session, closeUpdate, recheck } = useServer();
  const connection = config?.connection;
  if (!connection) return null;
  return (
    <ServerUpdatePanel
      url={connection.url}
      anonKey={connection.anonKey}
      session={session}
      onLater={closeUpdate}
      onDone={closeUpdate}
      onUpdated={recheck}
    />
  );
}

export default ServerUpdateScreen;
