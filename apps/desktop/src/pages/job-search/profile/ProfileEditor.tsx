import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import type { ProfileForm, TextFieldKey } from "../../../features/job-search/profileDraft";
import type { ProfileDraft, SavedProfile } from "../../../features/job-search/types";
import ExperienceList from "./ExperienceList";
import ProfileField, { FieldLabel, type SourceKinds } from "./ProfileField";
import { AlertIcon } from "./ProfileIcons";
import SkillChips from "./SkillChips";
import { formatDay, formatDayTime, type StatusLine } from "./profileFormat";

interface ProfileEditorProps {
  form: ProfileForm;
  draft: ProfileDraft | null;
  latest: SavedProfile | null;
  nextVersion: number;
  kinds: SourceKinds;
  busy: boolean;
  status: StatusLine;
  onChange: (form: ProfileForm) => void;
  onSave: () => void;
  onDiscard: () => void;
}

/**
 * 오른쪽 판: 항목별 편집 (R19–R22).
 * 초안이 있으면 초안을, 없으면 저장된 프로필을 바로 고친다. 저장하면 새 버전이 되고 초안은 지워진다.
 */
function ProfileEditor({
  form,
  draft,
  latest,
  nextVersion,
  kinds,
  busy,
  status,
  onChange,
  onSave,
  onDiscard,
}: ProfileEditorProps) {
  function setText(key: TextFieldKey, value: string) {
    onChange({ ...form, [key]: { ...form[key], value } });
  }

  const textField = (key: TextFieldKey, label: string, options?: { wide?: boolean; multiline?: boolean }) => (
    <ProfileField
      label={label}
      field={form[key]}
      kinds={kinds}
      wide={options?.wide}
      multiline={options?.multiline}
      onChange={(value) => setText(key, value)}
    />
  );

  return (
    <section className="js-profile__panel js-profile__editor">
      <div className="js-profile__editor-head">
        <h3>{draft ? "프로필 초안" : "프로필"}</h3>
        {draft ? (
          <span className="js-profile__chip js-profile__chip--accent">새 초안 · {formatDayTime(draft.createdAt)}</span>
        ) : (
          latest && (
            <span className="js-profile__chip">
              v{latest.version} · {formatDay(latest.savedAt)} 저장
            </span>
          )
        )}
      </div>
      {draft && (
        <div className="js-profile__draft-note">
          <AlertIcon />
          {latest
            ? `저장하기 전까지는 기존 프로필(v${latest.version})로 채점해요`
            : "저장하기 전까지는 채점에 쓰이지 않아요"}
        </div>
      )}
      <div className="js-profile__editor-body">
        {textField("desiredRoles", "희망 직무")}
        {textField("years", "경력 연수")}
        <div className="js-profile__field js-profile__field--wide">
          <FieldLabel label="기술스택 (숙련도)" sources={form.skills.sources} kinds={kinds} />
          <SkillChips items={form.skills.items} onChange={(items) => onChange({ ...form, skills: { ...form.skills, items } })} />
        </div>
        <div className="js-profile__field js-profile__field--wide">
          <FieldLabel label="경력·프로젝트" sources={[]} kinds={kinds} />
          <ExperienceList
            rows={form.experiences}
            kinds={kinds}
            onChange={(experiences) => onChange({ ...form, experiences })}
          />
        </div>
        {textField("education", "학력")}
        {textField("awards", "수상·자격")}
        {textField("strengths", "강점 요약", { wide: true, multiline: true })}
      </div>
      <div className="js-profile__editor-foot">
        {status ? (
          <span className={`js-profile__left js-profile__msg--${status.ok ? "ok" : "bad"}`} role="status">
            {status.text}
          </span>
        ) : (
          <span className="js-profile__left">
            저장하면 기존 점수에 "이전 프로필 기준" 표시가 붙어요. 다시 채점은 추천 공고 탭에서.
          </span>
        )}
        {draft && (
          <button type="button" className="setup-btn setup-btn--ghost" disabled={busy} onClick={onDiscard}>
            초안 버리기
          </button>
        )}
        <button type="button" className="setup-btn setup-btn--primary" disabled={busy} onClick={onSave}>
          <SmallCheckIcon size={16} />
          저장 (v{nextVersion})
        </button>
      </div>
    </section>
  );
}

export default ProfileEditor;
