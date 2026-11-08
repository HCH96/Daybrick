import { Fragment, useState } from "react";
import Popover from "../../../components/common/Popover";
import { ChevronRightIcon, SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { STAGES, STATUSES } from "../../../features/applications/statuses";
import type { StageId, StatusId } from "../../../features/applications/types";
import StatusBadge from "./StatusBadge";
import "./StatusPicker.css";

interface StatusPickerProps {
  status: StatusId;
  stage: StageId | null;
  onPick: (status: StatusId, stage: StageId | null) => void;
}

/** 세부 단계 창: 어느 상태 줄 옆에 떠 있는지, 열 때 첫 칸에 포커스를 줄지 */
interface SubMenu {
  status: StatusId;
  anchor: HTMLElement;
  focus: boolean;
}

/**
 * 상태 고르기 (R18·R19): 상태 목록 → 세부 단계가 있는 상태(▸)는 오른쪽에 세부 단계 창.
 * 종료는 구분선 아래에 따로 두어 어디서든 바로 고를 수 있다 (R20).
 */
function StatusPicker({ status, stage, onPick }: StatusPickerProps) {
  const [sub, setSub] = useState<SubMenu | null>(null);

  const openSub = (id: StatusId, anchor: HTMLElement, focus: boolean) => {
    setSub((s) => (s && s.status === id && s.anchor === anchor && s.focus === focus ? s : { status: id, anchor, focus }));
  };

  return (
    <div className="status-picker" role="menu" aria-label="상태">
      {STATUSES.map((def) => {
        const classes = ["pop-row", "status-picker__row"];
        if (def.id === status || sub?.status === def.id) classes.push("pop-row--active");
        return (
          <Fragment key={def.id}>
            {def.id === "closed" && <div className="pop-sep" />}
            <button
              type="button"
              role="menuitem"
              className={classes.join(" ")}
              aria-haspopup={def.hasStage ? "menu" : undefined}
              aria-expanded={def.hasStage ? sub?.status === def.id : undefined}
              onMouseEnter={(e) => (def.hasStage ? openSub(def.id, e.currentTarget, false) : setSub(null))}
              onClick={(e) => {
                if (def.hasStage) openSub(def.id, e.currentTarget, true);
                else onPick(def.id, null);
              }}
              onKeyDown={(e) => {
                if (def.hasStage && e.key === "ArrowRight") {
                  e.preventDefault();
                  openSub(def.id, e.currentTarget, true);
                }
              }}
            >
              <StatusBadge status={def.id} stage={null} />
              {def.hasStage && (
                <span className="status-picker__more">
                  <ChevronRightIcon size={12} />
                </span>
              )}
            </button>
          </Fragment>
        );
      })}

      {sub && (
        <Popover
          anchor={sub.anchor}
          placement="right-start"
          width={130}
          ariaLabel="세부 단계"
          className="status-picker__sub"
          onClose={() => setSub(null)}
        >
          <div className="pop-caption">세부 단계</div>
          {STAGES.map((s, i) => {
            const current = sub.status === status && s.id === stage;
            return (
              <button
                key={s.id}
                type="button"
                role="menuitem"
                className="pop-row"
                autoFocus={sub.focus && (current || (i === 0 && !(sub.status === status && stage)))}
                onClick={() => onPick(sub.status, s.id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    sub.anchor.focus();
                    setSub(null);
                  }
                }}
              >
                {s.label}
                {current && (
                  <span className="pop-row__check">
                    <SmallCheckIcon size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </Popover>
      )}
    </div>
  );
}

export default StatusPicker;
