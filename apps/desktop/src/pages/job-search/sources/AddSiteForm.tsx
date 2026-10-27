import type { Adapter, Site } from "../../../features/job-search/types";
import RuleFilePicker, { type RuleFile } from "./RuleFilePicker";

/** 사이트 추가 창 왼쪽 입력값 */
export interface AddSiteInput {
  name: string;
  url: string;
  /** 어댑터: 기존 것 고르기 또는 규칙 파일 올리기 (교체 때는 늘 file) */
  source: "existing" | "file";
  adapterId: string;
  /** 사이트별 값 (규칙의 vars 이름 → 값) */
  vars: Record<string, string>;
  /** 교체 때 시험에 쓸 사이트 */
  testSiteId: string;
}

interface AddSiteFormProps {
  /** 새 버전을 올릴 어댑터. 사이트 추가면 null */
  replacing: Adapter | null;
  adapters: Adapter[];
  /** 교체할 어댑터를 쓰는 사이트들 */
  usingSites: Site[];
  input: AddSiteInput;
  ruleFile: RuleFile | null;
  /** 값 칸을 보여 줄 사이트별 값 이름 (시험 사이트의 값을 쓰면 빈 배열) */
  varNames: string[];
  onEdit: (next: Partial<AddSiteInput>) => void;
  onPickFile: (file: RuleFile) => void;
}

function TextField({ label, value, placeholder, onChange }: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="wiz-field">
      <span className="wiz-field__label">{label}</span>
      <span className="wiz-input">
        <input
          className="wiz-input__field"
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
      </span>
    </label>
  );
}

/** 사이트 추가 창 왼쪽 (R28): 이름·주소·어댑터·사이트별 값. 교체(R32)면 규칙 파일과 시험 사이트만 */
function AddSiteForm({ replacing, adapters, usingSites, input, ruleFile, varNames, onEdit, onPickFile }: AddSiteFormProps) {
  const varsTitle = varNames.length > 0 ? `사이트별 값 (${varNames.length}개)` : null;
  return (
    <div className="js-add__fields">
      {replacing ? (
        <>
          <div className="wiz-field">
            <span className="wiz-field__label">
              새 규칙 파일 (.json)
              <span className="wiz-field__note">지금 v{replacing.version}</span>
            </span>
            <RuleFilePicker file={ruleFile} onPick={onPickFile} />
          </div>
          {usingSites.length > 0 && (
            <label className="wiz-field">
              <span className="wiz-field__label">시험할 사이트</span>
              <select
                className="js-add__select"
                value={input.testSiteId}
                onChange={(e) => onEdit({ testSiteId: e.target.value })}
              >
                {usingSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      ) : (
        <>
          <TextField label="이름" value={input.name} placeholder="예: 스마일게이트 RPG" onChange={(name) => onEdit({ name })} />
          <TextField label="목록 주소" value={input.url} placeholder="https://" onChange={(url) => onEdit({ url })} />
          <div className="wiz-field" role="radiogroup" aria-label="어댑터">
            <span className="wiz-field__label">어댑터</span>
            <div className={`js-add__radio${input.source === "existing" ? " js-add__radio--on" : ""}`}>
              <label>
                <input
                  type="radio"
                  name="js-add-source"
                  checked={input.source === "existing"}
                  disabled={adapters.length === 0}
                  onChange={() => onEdit({ source: "existing" })}
                />
                기존 어댑터 고르기
              </label>
              <select
                className="js-add__select"
                value={input.adapterId}
                aria-label="기존 어댑터"
                disabled={adapters.length === 0}
                onChange={(e) => onEdit({ adapterId: e.target.value, source: "existing" })}
              >
                {adapters.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} v{a.version}
                  </option>
                ))}
              </select>
            </div>
            <div className={`js-add__radio js-add__radio--col${input.source === "file" ? " js-add__radio--on" : ""}`}>
              <label>
                <input
                  type="radio"
                  name="js-add-source"
                  checked={input.source === "file"}
                  onChange={() => onEdit({ source: "file" })}
                />
                규칙 파일 올리기 (.json)
              </label>
              <RuleFilePicker file={ruleFile} onPick={onPickFile} />
            </div>
          </div>
        </>
      )}
      {varsTitle && (
        <div className="wiz-field">
          <span className="wiz-field__label">
            {varsTitle}
            <span className="wiz-field__note">어댑터가 요구하는 값</span>
          </span>
          <div className="js-add__vars">
            {varNames.map((name) => (
              <label key={name} className="js-add__var">
                <span className="js-add__var-name">{name}</span>
                <span className="wiz-input">
                  <input
                    className="wiz-input__field"
                    value={input.vars[name] ?? ""}
                    spellCheck={false}
                    onChange={(e) => onEdit({ vars: { ...input.vars, [name]: e.target.value } })}
                  />
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AddSiteForm;
