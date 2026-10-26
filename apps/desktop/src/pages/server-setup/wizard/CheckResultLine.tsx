import type { ReactNode } from "react";
import { SmallCheckIcon, ExternalLinkIcon } from "../../../components/icons/CommonIcons";
import {
  ArrowUpIcon,
  CloudOffIcon,
  CrossIcon,
  KeyIcon,
  PauseIcon,
  UserIcon,
} from "../../../components/icons/ServerIcons";
import { keysCheckMessage } from "../../../features/server/messages";
import type { KeysCheck } from "../../../features/server/probe";
import { openExternal } from "./openExternal";

/** 결과 종류마다 아이콘 */
function iconFor(check: KeysCheck): ReactNode {
  switch (check.kind) {
    case "ok":
      if (check.route === "setup") return <SmallCheckIcon size={18} />;
      return check.route === "login" ? <UserIcon /> : <ArrowUpIcon />;
    case "bad-url":
      return <CrossIcon />;
    case "bad-key-format":
    case "secret-key":
    case "bad-key":
      return <KeyIcon />;
    case "unreachable":
      return <CloudOffIcon />;
    case "paused":
      return <PauseIcon />;
  }
}

/** ② 확인 결과 줄: 성공 초록, 오류 빨강, 일시정지 주황, 이미 세팅·업데이트 필요 보라 (R4, R6) */
function CheckResultLine({ check }: { check: KeysCheck }) {
  const message = keysCheckMessage(check);
  return (
    <div className={`wiz-alert wiz-alert--${message.tone}`} role={message.tone === "bad" ? "alert" : "status"}>
      <span className="wiz-alert__icon">{iconFor(check)}</span>
      <div>
        <b>{message.title}</b>
        <p>
          {message.desc}
          {message.link && (
            <>
              {" "}
              <button
                type="button"
                className="wiz-guide__link"
                onClick={() => message.link && openExternal(message.link.url)}
              >
                {message.link.label}
                <ExternalLinkIcon size={13} />
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default CheckResultLine;
