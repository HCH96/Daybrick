import { useMemo, useState, type KeyboardEvent } from "react";
import Popover from "../../../components/common/Popover";
import { SearchIcon } from "../../../components/icons/PlanIcons";
import { useApplications } from "../../../features/applications/store";
import { buildCardPickList, type LinkCardItem } from "../../../features/plan/applicationLinks";
import StatusBadge from "../../applications/status/StatusBadge";
import "./CardPickDialog.css";

interface CardPickDialogProps {
  anchor: HTMLElement;
  onPick: (applicationId: string) => void;
  onClose: () => void;
}

/**
 * 지원 카드 고르기 작은 창 (목업 part-card-pick, R39).
 * 찾기칸(제목·회사), 진행 중 카드(가까운 일정 순) 먼저, 종료 카드는 아래에 흐리게.
 * 한 줄을 누르거나 ↑↓로 고른 뒤 Enter면 연결하고 닫는다. Esc·바깥 누르기는 Popover가 닫는다.
 */
function CardPickDialog({ anchor, onPick, onClose }: CardPickDialogProps) {
  const { state } = useApplications();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const list = useMemo(
    () => (state.kind === "ready" ? buildCardPickList(state.data, query, new Date()) : null),
    [state, query],
  );
  const flat = list ? [...list.active, ...list.closed] : [];
  const current = Math.min(cursor, flat.length - 1);

  const pick = (item: LinkCardItem) => {
    onPick(item.application.id);
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (flat.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setCursor((Math.max(current, 0) + step + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (current >= 0) pick(flat[current]);
    }
  };

  const total = state.kind === "ready" ? state.data.applications.length : 0;

  return (
    <Popover anchor={anchor} onClose={onClose} width={420} ariaLabel="지원 카드 고르기" className="card-pick">
      <label className="card-pick__field">
        <SearchIcon size={16} />
        <input
          className="card-pick__input"
          value={query}
          placeholder="회사나 카드 제목으로 찾기"
          aria-label="지원 카드 찾기"
          autoFocus
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
          onKeyDown={onKeyDown}
        />
      </label>

      <div className="card-pick__list" role="listbox" aria-label="지원 카드">
        {state.kind === "loading" && <div className="card-pick__empty">지원 데이터를 불러오는 중…</div>}
        {state.kind === "error" && <div className="card-pick__empty">지원 데이터를 읽지 못해 카드를 고를 수 없어요</div>}
        {list && total === 0 && <div className="card-pick__empty">지원관리에 카드가 없어요. 지원관리에서 먼저 카드를 만들어 주세요.</div>}
        {list && total > 0 && flat.length === 0 && <div className="card-pick__empty">찾는 카드가 없어요</div>}
        {list && list.active.length > 0 && <div className="card-pick__group">진행 중</div>}
        {list?.active.map((item, i) => (
          <PickRow key={item.application.id} item={item} on={i === current} onPick={() => pick(item)} onHover={() => setCursor(i)} />
        ))}
        {list && list.closed.length > 0 && <div className="card-pick__group">종료</div>}
        {list?.closed.map((item, i) => {
          const index = list.active.length + i;
          return (
            <PickRow key={item.application.id} item={item} on={index === current} ended onPick={() => pick(item)} onHover={() => setCursor(index)} />
          );
        })}
      </div>

      <div className="card-pick__foot">
        <span>↑↓ 고르기 · Enter 연결 · Esc 닫기</span>
        {total > 0 && <span>카드 {flat.length}개</span>}
      </div>
    </Popover>
  );
}

interface PickRowProps {
  item: LinkCardItem;
  on: boolean;
  ended?: boolean;
  onPick: () => void;
  onHover: () => void;
}

function PickRow({ item, on, ended = false, onPick, onHover }: PickRowProps) {
  const classes = ["card-pick__row"];
  if (on) classes.push("card-pick__row--on");
  if (ended) classes.push("card-pick__row--ended");
  return (
    <button
      type="button"
      role="option"
      aria-selected={on}
      className={classes.join(" ")}
      tabIndex={-1}
      onClick={onPick}
      onMouseMove={onHover}
    >
      <span className="card-pick__main">
        <span className="card-pick__title">{item.title}</span>
        {item.sub && <span className="card-pick__sub">{item.sub}</span>}
      </span>
      <StatusBadge status={item.application.status} stage={item.application.stage} />
    </button>
  );
}

export default CardPickDialog;
