import { Fragment, useId, useState } from "react";
import { ChevronDownIcon, ExternalLinkIcon } from "../../../components/icons/CommonIcons";
import { HelpIcon } from "../../../components/icons/ServerIcons";
import type { FieldHelp } from "./guides";
import { openExternal } from "./openExternal";

/** 입력칸 아래 "어디서 찾나요?": 누르면 바로 아래에 펼쳐지고 다시 누르면 닫힌다 (R8) */
function HelpToggle({ help }: { help: FieldHelp }) {
  const [open, setOpen] = useState(false);
  const popId = useId();

  return (
    <>
      <button
        type="button"
        className={open ? "wiz-help wiz-help--open" : "wiz-help"}
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => setOpen((v) => !v)}
      >
        <HelpIcon size={16} />
        어디서 찾나요?
        <span className="wiz-help__chevron" aria-hidden="true">
          <ChevronDownIcon size={16} />
        </span>
      </button>
      {open && (
        <div className="wiz-help-pop" id={popId}>
          <div className="wiz-help-pop__title">
            {help.title}
            {help.link && (
              <button
                type="button"
                className="wiz-guide__link"
                onClick={() => help.link && openExternal(help.link.url)}
              >
                {help.link.label}
                <ExternalLinkIcon size={16} />
              </button>
            )}
          </div>
          <div className="wiz-path">
            {help.path.map((part, i) => (
              <Fragment key={part}>
                {i > 0 && <em>›</em>}
                <i>{part}</i>
              </Fragment>
            ))}
          </div>
          <div className="wiz-shot" aria-hidden="true">
            {help.shot.map((row) => (
              <div key={row.name} className="wiz-shot__row">
                <span>{row.name}</span>
                <span className={row.highlight ? "wiz-shot__hl" : undefined}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default HelpToggle;
