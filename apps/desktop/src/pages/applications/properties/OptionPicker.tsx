import { useState, type KeyboardEvent } from "react";
import { DotsIcon, SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { createOption } from "../../../features/applications/propertyOps";
import { nextOptionColor } from "../../../features/applications/propertyTypes";
import { useApplications } from "../../../features/applications/store";
import type { OptionColor, PropertyDef, PropertyOption } from "../../../features/applications/types";
import ColorPalette from "./ColorPalette";
import OptionChip from "./OptionChip";
import OptionMenu from "./OptionMenu";
import "./OptionPicker.css";

interface OptionPickerProps {
  property: PropertyDef;
  /** 고른 항목 id들 (선택이면 0~1개) */
  selected: readonly string[];
  multi: boolean;
  onChange: (ids: string[]) => void;
  /** 선택(단일)에서 하나를 고르면 부른다 → 창을 닫는다 */
  onDone: () => void;
}

type Row = { kind: "create"; name: string } | { kind: "option"; option: PropertyOption };

/**
 * 선택 항목 고르기·추가 (R30, 목업 "선택 항목 고르기·추가").
 * 위 입력 칸에 쓰면 목록이 걸러지고, 없는 이름이면 "새로 만들기"가 뜬다. 새 항목 색은 아래 8색에서 고른다.
 * ↑↓로 줄을 옮기고 Enter로 고른다. 빈 입력 칸에서 Backspace를 누르면 마지막으로 고른 항목을 뺀다.
 */
function OptionPicker({ property, selected, multi, onChange, onDone }: OptionPickerProps) {
  const { changeProperties } = useApplications();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [newColor, setNewColor] = useState<OptionColor>(() => nextOptionColor(property));
  const [menu, setMenu] = useState<{ optionId: string; anchor: HTMLElement } | null>(null);

  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const filtered = property.options.filter((o) => o.name.toLowerCase().includes(lower));
  const exact = property.options.some((o) => o.name.toLowerCase() === lower);
  const rows: Row[] = [
    ...(trimmed !== "" && !exact ? [{ kind: "create", name: trimmed } as const] : []),
    ...filtered.map((option) => ({ kind: "option", option }) as const),
  ];
  const activeIndex = Math.min(active, rows.length - 1);
  const selectedOptions = selected
    .map((id) => property.options.find((o) => o.id === id))
    .filter((o): o is PropertyOption => o !== undefined);
  const menuOption = menu ? property.options.find((o) => o.id === menu.optionId) : undefined;

  const pick = (optionId: string) => {
    if (multi) {
      onChange(selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId]);
      setQuery("");
      setActive(0);
    } else {
      onChange([optionId]);
      onDone();
    }
  };

  const activate = (row: Row) => {
    if (row.kind === "option") {
      pick(row.option.id);
      return;
    }
    const option = createOption(row.name, newColor);
    changeProperties({ type: "add-option", propertyId: property.id, option });
    // 다음에 만들 항목은 다음 색으로 시작한다
    setNewColor(nextOptionColor({ ...property, options: [...property.options, option] }));
    pick(option.id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (rows.length === 0) return;
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + delta + rows.length) % rows.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = rows[activeIndex];
      if (row) activate(row);
    } else if (e.key === "Backspace" && query === "" && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  return (
    <div className="option-picker">
      <div className="option-picker__input">
        {selectedOptions.map((o) => (
          <OptionChip key={o.id} name={o.name} color={o.color} onRemove={() => onChange(selected.filter((id) => id !== o.id))} />
        ))}
        <input
          className="option-picker__text"
          value={query}
          placeholder={selectedOptions.length === 0 ? "항목 찾기 또는 새로 쓰기" : ""}
          aria-label={`${property.name} 항목 찾기`}
          autoFocus
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      <div className="pop-caption">항목 고르기 또는 새로 만들기</div>
      {rows.length === 0 && <div className="pop-hint">항목이 없어요. 이름을 쓰면 새로 만들 수 있어요.</div>}
      <div className="option-picker__list" role="listbox" aria-label={`${property.name} 항목`} aria-multiselectable={multi}>
        {rows.map((row, i) =>
          row.kind === "create" ? (
            <div
              key="__create"
              role="option"
              aria-selected={false}
              className={i === activeIndex ? "option-picker__row option-picker__row--active" : "option-picker__row"}
              onMouseEnter={() => setActive(i)}
              onClick={() => activate(row)}
            >
              <span className="option-picker__create">
                새로 만들기 <OptionChip name={row.name} color={newColor} />
              </span>
            </div>
          ) : (
            <div
              key={row.option.id}
              role="option"
              aria-selected={selected.includes(row.option.id)}
              className={i === activeIndex ? "option-picker__row option-picker__row--active" : "option-picker__row"}
              onMouseEnter={() => setActive(i)}
              onClick={() => activate(row)}
            >
              <OptionChip name={row.option.name} color={row.option.color} />
              <span className="option-picker__tail">
                {selected.includes(row.option.id) && (
                  <span className="pop-row__check">
                    <SmallCheckIcon size={14} />
                  </span>
                )}
                <button
                  type="button"
                  className="option-picker__dots"
                  title="이름·색 바꾸기, 삭제"
                  aria-label={`${row.option.name} 항목 편집`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const anchor = e.currentTarget;
                    setMenu((m) => (m?.optionId === row.option.id ? null : { optionId: row.option.id, anchor }));
                  }}
                >
                  <DotsIcon />
                </button>
              </span>
            </div>
          ),
        )}
      </div>

      {rows[0]?.kind === "create" && (
        <>
          <div className="pop-caption">새 항목 색</div>
          <ColorPalette value={newColor} onChange={setNewColor} />
        </>
      )}

      {menu && menuOption && (
        <OptionMenu property={property} option={menuOption} anchor={menu.anchor} onClose={() => setMenu(null)} />
      )}
    </div>
  );
}

export default OptionPicker;
