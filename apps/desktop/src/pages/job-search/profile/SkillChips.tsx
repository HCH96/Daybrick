import { useState } from "react";
import { PlusIcon, SmallCloseIcon } from "../../../components/icons/CommonIcons";
import { nextSkillLevel, skillLevelLabel } from "../../../features/job-search/profileDraft";
import type { ProfileSkill } from "../../../features/job-search/types";
import { BLANK_FIELD } from "../../../features/job-search/messages";

/** 숙련도 → 칩 색 클래스 (목업 lv-h·lv-m·lv-l) */
const LEVEL_CLASS: Record<ProfileSkill["level"], string> = {
  high: "js-profile__lv--h",
  mid: "js-profile__lv--m",
  low: "js-profile__lv--l",
};

interface SkillChipsProps {
  items: ProfileSkill[];
  onChange: (items: ProfileSkill[]) => void;
}

/** 기술스택 칩 (R19): 숙련도 칩을 누르면 상 → 중 → 하, ×로 빼고, "추가"로 이름을 넣는다 (처음 숙련도는 중) */
function SkillChips({ items, onChange }: SkillChipsProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function add() {
    const trimmed = name.trim();
    if (trimmed !== "" && !items.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...items, { name: trimmed, level: "mid" }]);
    }
    setName("");
    setAdding(false);
  }

  return (
    <div className="js-profile__skills">
      {items.length === 0 && !adding && <span className="js-profile__blank">{BLANK_FIELD}</span>}
      {items.map((skill, index) => (
        <span key={skill.name} className="js-profile__skill">
          {skill.name}
          <button
            type="button"
            className={`js-profile__lv ${LEVEL_CLASS[skill.level]}`}
            title="숙련도 바꾸기 (상·중·하)"
            onClick={() =>
              onChange(items.map((s, i) => (i === index ? { ...s, level: nextSkillLevel(s.level) } : s)))
            }
          >
            {skillLevelLabel(skill.level)}
          </button>
          <button
            type="button"
            className="js-profile__skill-x"
            aria-label={`${skill.name} 빼기`}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            <SmallCloseIcon size={10} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          className="js-profile__skill-input"
          autoFocus
          value={name}
          placeholder="기술 이름"
          onChange={(e) => setName(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
            if (e.key === "Escape") {
              setName("");
              setAdding(false);
            }
          }}
        />
      ) : (
        <button type="button" className="js-profile__mini-btn" onClick={() => setAdding(true)}>
          <PlusIcon size={13} />
          추가
        </button>
      )}
    </div>
  );
}

export default SkillChips;
