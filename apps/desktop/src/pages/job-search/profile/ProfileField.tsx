import { BLANK_FIELD } from "../../../features/job-search/messages";
import type { FormText } from "../../../features/job-search/profileDraft";
import type { ProfileSourceKind } from "../../../features/job-search/types";
import { FileIcon, TextIcon } from "./ProfileIcons";

/** 자료 이름 → 종류 (출처 아이콘을 고를 때) */
export type SourceKinds = ReadonlyMap<string, ProfileSourceKind>;

/** 항목 오른쪽 위 출처 표시 (R20). 붙여 넣은 텍스트에서만 왔으면 글 아이콘, 아니면 파일 아이콘 */
export function SourceTag({ names, kinds }: { names: readonly string[]; kinds: SourceKinds }) {
  if (names.length === 0) return null;
  const textOnly = names.every((name) => kinds.get(name) === "text");
  return (
    <span className="js-profile__from" title={names.join(", ")}>
      {textOnly ? <TextIcon size={12} /> : <FileIcon size={12} />}
      {names.join(", ")}
    </span>
  );
}

/** 항목 이름 줄: 이름과 출처 */
export function FieldLabel({ label, sources, kinds }: { label: string; sources: readonly string[]; kinds: SourceKinds }) {
  return (
    <div className="js-profile__label">
      {label}
      <SourceTag names={sources} kinds={kinds} />
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  field: FormText;
  kinds: SourceKinds;
  onChange: (value: string) => void;
  /** 두 칸을 다 쓰는 넓은 항목 */
  wide?: boolean;
  /** 여러 줄 글 (강점 요약) */
  multiline?: boolean;
}

/** 글 항목 하나: 이름·출처 + 편집 칸. 비어 있으면 "자료에 없음" 흐린 글씨 (R20) */
function ProfileField({ label, field, kinds, onChange, wide, multiline }: ProfileFieldProps) {
  return (
    <div className={`js-profile__field${wide ? " js-profile__field--wide" : ""}`}>
      <FieldLabel label={label} sources={field.sources} kinds={kinds} />
      {multiline ? (
        <textarea
          className="js-profile__input js-profile__input--area"
          value={field.value}
          placeholder={BLANK_FIELD}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="js-profile__input"
          value={field.value}
          placeholder={BLANK_FIELD}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export default ProfileField;
