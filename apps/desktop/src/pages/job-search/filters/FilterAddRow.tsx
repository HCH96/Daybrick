import { useState, type FormEvent } from "react";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { DEV_WORDS, KIND_INFO, parseFilterInput, type AddableKind } from "../../../features/job-search/filterRules";

interface FilterAddRowProps {
  kinds: AddableKind[];
  disabled: boolean;
  /** 저장에 성공하면 true (입력 칸을 비운다) */
  onAdd: (kind: AddableKind, value: unknown) => Promise<boolean>;
}

/** 조건 추가 줄 (R45): 종류 고르기 + 값 입력 + [추가]. Enter로도 추가 */
function FilterAddRow({ kinds, disabled, onAdd }: FilterAddRowProps) {
  const [kind, setKind] = useState<AddableKind>(kinds[0]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFilterInput(kind, text);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    if (await onAdd(kind, parsed.value)) setText("");
  }

  return (
    <form className="js-filters__add" onSubmit={(e) => void submit(e)}>
      <div className="js-filters__add-row">
        <select
          className="js-filters__input js-filters__select"
          aria-label="조건 종류"
          value={kind}
          disabled={disabled}
          onChange={(e) => {
            const next = kinds.find((k) => k === e.target.value);
            if (next) setKind(next);
            setError(null);
          }}
        >
          {kinds.map((k) => (
            <option key={k} value={k}>
              {KIND_INFO[k].label}
            </option>
          ))}
        </select>
        <input
          className="js-filters__input"
          aria-label="조건 값"
          value={text}
          placeholder={KIND_INFO[kind].placeholder}
          inputMode={kind === "max-years" ? "numeric" : undefined}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
        />
        <button type="submit" className="setup-btn" disabled={disabled || text.trim() === ""}>
          <PlusIcon size={14} />
          추가
        </button>
      </div>
      {kind === "max-years" && !error && <p className="js-filters__hint">넣은 연수 이상을 요구하는 공고를 제외해요.</p>}
      {kind === "title-nondev" && !error && (
        <p className="js-filters__hint">
          제목·직무에 낱말이 있으면 거르고, {DEV_WORDS.join("·")} 낱말이 함께 있으면 거르지 않아요.
        </p>
      )}
      {error && (
        <p className="js-filters__hint js-filters__hint--bad" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default FilterAddRow;
