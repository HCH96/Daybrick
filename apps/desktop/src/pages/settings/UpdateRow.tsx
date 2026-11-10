import type { CSSProperties } from "react";
import { useUpdater, type UpdaterPhase } from "../../features/updater/UpdaterProvider";
import "./UpdateRow.css";

/** 찾은 새 버전이 있는 상태 (새 버전 번호·변경 내용·설치 버튼을 보인다) */
type FoundPhase = Extract<UpdaterPhase, { version: string }>;

function hasFound(phase: UpdaterPhase): phase is FoundPhase {
  return "version" in phase;
}

/** 받는 중 진행률. 퍼센트를 모르면 막대 없이 글자만 (R20) */
function DownloadProgress({ percent }: { percent: number | null }) {
  if (percent === null) return <p className="update-row__progress-label">받는 중…</p>;
  const style = { "--update-ratio": percent / 100 } as CSSProperties;
  return (
    <div className="update-row__progress">
      <p className="update-row__progress-label">받는 중 {percent}%</p>
      <div
        className="update-row__bar"
        role="progressbar"
        aria-label="업데이트 받는 중"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <i style={style} />
      </div>
    </div>
  );
}

/** 버튼 아래 결과·실패 문구 (R12, R22, R23) */
function ResultText({ phase }: { phase: UpdaterPhase }) {
  switch (phase.kind) {
    case "upToDate":
      return <p className="update-row__result">최신 버전이에요</p>;
    case "checkFailed":
      return (
        <p className="app-section__error" role="alert">
          업데이트를 확인하지 못했어요. 인터넷 연결을 확인해 주세요.
        </p>
      );
    case "downloadFailed":
      return (
        <p className="app-section__error" role="alert">
          업데이트를 받지 못했어요. 다시 시도해 주세요.
        </p>
      );
    case "signatureFailed":
      return (
        <p className="app-section__error" role="alert">
          업데이트 파일을 확인하지 못해 설치하지 않았어요.
        </p>
      );
    default:
      return null;
  }
}

/** 설정 "앱" 칸의 업데이트 줄: 현재 버전, [업데이트 확인], 새 버전·진행률·결과 (자동 업데이트 R10–R13, R15, R20, R22, R23) */
function UpdateRow() {
  const updater = useUpdater();
  if (!updater) return null;
  const { phase, info, checkNow, install } = updater;

  const devMode = info !== null && !info.available;
  const busy = phase.kind === "checking" || phase.kind === "downloading" || phase.kind === "installing";
  const buttonsOff = info === null || devMode || busy;

  return (
    <div className="settings-card__pad update-row">
      <div className="app-section__row">
        <div className="app-section__txt">
          <b>업데이트</b>
          {info !== null && info.currentVersion !== "" && (
            <p className="app-section__desc update-row__version">현재 버전 {info.currentVersion}</p>
          )}
          {devMode && <p className="app-section__note">개발 모드에서는 업데이트할 수 없어요</p>}
        </div>
        <button type="button" className="settings-btn settings-btn--sm update-row__btn" disabled={buttonsOff} onClick={checkNow}>
          {phase.kind === "checking" ? "확인 중…" : "업데이트 확인"}
        </button>
      </div>

      {hasFound(phase) && (
        <div className="update-row__found">
          <b className="update-row__new">새 버전 {phase.version}</b>
          {phase.notes !== null && phase.notes.trim() !== "" && <p className="update-row__notes">{phase.notes}</p>}
          {phase.kind === "downloading" && <DownloadProgress percent={phase.percent} />}
          <div className="update-row__actions">
            <button type="button" className="settings-btn settings-btn--primary update-row__btn" disabled={buttonsOff} onClick={install}>
              설치하고 다시 시작
            </button>
          </div>
        </div>
      )}

      <ResultText phase={phase} />
    </div>
  );
}

export default UpdateRow;
