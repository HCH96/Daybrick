import type { StatusLine } from "../profile/profileFormat";
import { ArchiveIcon } from "../recommend/RecommendIcons";
import { BriefcaseIcon, SparkIcon, UndoIcon } from "./PopupIcons";

/** scored: [지원 안 함][지원하기], unscored: [지원 안 함][그래도 채점], archived: [되돌리기] */
export type FootMode = "scored" | "unscored" | "archived";

export type FootBusy = "hide" | "restore" | "force" | "apply" | "unbundle" | null;

interface PopupFootProps {
  mode: FootMode;
  /** 왼쪽 흐린 안내 (채점 기준·걸린 조건·보관일) */
  note: string;
  /** 단추 결과 줄. 있으면 안내 대신 보인다 */
  status: StatusLine;
  busy: FootBusy;
  /** 마감 지난 보관 공고는 되돌리기를 끈다 (R15) */
  restoreDisabled: boolean;
  onHide: () => void;
  onForce: () => void;
  onRestore: () => void;
  /** 지원하기 (R54). 없으면 단추를 막아 둔다 */
  onApply?: () => void;
}

/** 팝업 아래 단추 줄 (R14, R15, R46, R49) */
function PopupFoot(props: PopupFootProps) {
  const { mode, note, status, busy } = props;
  const disabled = busy !== null;
  return (
    <div className="js-popup__foot">
      {status ? (
        <span className={`js-popup__left js-popup__left--${status.ok ? "ok" : "bad"}`} role="status">
          {status.text}
        </span>
      ) : (
        <span className="js-popup__left">{note}</span>
      )}
      {mode === "archived" ? (
        <button
          type="button"
          className="setup-btn"
          disabled={disabled || props.restoreDisabled}
          onClick={props.onRestore}
        >
          <UndoIcon />
          {busy === "restore" ? "되돌리는 중…" : "되돌리기"}
        </button>
      ) : (
        <>
          <button type="button" className="setup-btn" disabled={disabled} onClick={props.onHide}>
            <ArchiveIcon />
            {busy === "hide" ? "옮기는 중…" : "지원 안 함"}
          </button>
          {mode === "scored" ? (
            <button
              type="button"
              className="setup-btn setup-btn--primary"
              disabled={disabled || !props.onApply}
              onClick={props.onApply}
            >
              <BriefcaseIcon />
              {busy === "apply" ? "지원 카드 만드는 중…" : "지원하기"}
            </button>
          ) : (
            <button type="button" className="setup-btn setup-btn--primary" disabled={disabled} onClick={props.onForce}>
              <SparkIcon />
              {busy === "force" ? "채점하는 중…" : "그래도 채점"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default PopupFoot;
