import { useRef } from "react";
import { checkRuleText, type RuleCheck } from "../../../features/job-search/adapterRule";
import { UploadIcon } from "./SourcesIcons";

/** 올린 규칙 파일과 형식 검사 결과 */
export interface RuleFile {
  fileName: string;
  check: RuleCheck;
}

interface RuleFilePickerProps {
  file: RuleFile | null;
  onPick: (file: RuleFile) => void;
}

/** 규칙 파일(.json) 고르기 단추와, 형식 검사에서 빠진 키 목록(빨간 글) (R29) */
function RuleFilePicker({ file, onPick }: RuleFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function read(picked: File) {
    const text = await picked.text();
    onPick({ fileName: picked.name, check: checkRuleText(text) });
  }

  return (
    <div className="js-add__file">
      <div className="js-add__file-row">
        <button type="button" className="setup-btn js-add__small-btn" onClick={() => inputRef.current?.click()}>
          <UploadIcon />
          파일 선택
        </button>
        <span className={file ? "js-add__file-name" : "js-add__faint"}>{file ? file.fileName : "고른 파일 없음"}</span>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const picked = e.target.files?.[0];
            e.target.value = "";
            if (picked) void read(picked);
          }}
        />
      </div>
      {file && !file.check.ok && (
        <ul className="js-add__errors" role="alert">
          {file.check.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      {file?.check.ok && <span className="js-add__ok">형식 검사 통과</span>}
    </div>
  );
}

export default RuleFilePicker;
