import { useState } from "react";
import { PlusIcon, SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import { BLANK_FIELD } from "../../../features/job-search/messages";
import { emptyExperience, type FormExperience } from "../../../features/job-search/profileDraft";
import { SourceTag, type SourceKinds } from "./ProfileField";
import { PencilIcon } from "./ProfileIcons";

interface ExperienceListProps {
  rows: FormExperience[];
  kinds: SourceKinds;
  onChange: (rows: FormExperience[]) => void;
}

type TextKey = "title" | "period" | "did" | "results" | "tech";

/** 보기 줄: 한 일·성과·기술 중 값이 있는 것만 */
const DETAIL_ROWS: readonly { key: "did" | "results" | "tech"; label: string }[] = [
  { key: "did", label: "한 일" },
  { key: "results", label: "성과" },
  { key: "tech", label: "기술" },
];

/** 경력·프로젝트 목록 (R19): 줄을 눌러 고치고, 맨 아래 "추가"로 새 줄, 휴지통으로 빼기 */
function ExperienceList({ rows, kinds, onChange }: ExperienceListProps) {
  const [editing, setEditing] = useState<string | null>(null);

  function update(key: string, field: TextKey, value: string) {
    onChange(rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function remove(key: string) {
    onChange(rows.filter((row) => row.key !== key));
    if (editing === key) setEditing(null);
  }

  function add() {
    const row = emptyExperience();
    onChange([...rows, row]);
    setEditing(row.key);
  }

  return (
    <div className="js-profile__exps">
      {rows.length === 0 && <div className="js-profile__blank">{BLANK_FIELD}</div>}
      {rows.map((row) =>
        editing === row.key ? (
          <div key={row.key} className="js-profile__exp js-profile__exp--edit">
            <div className="js-profile__exp-grid">
              <input
                className="js-profile__input"
                value={row.title}
                placeholder="회사·팀·역할 또는 프로젝트"
                aria-label="회사·역할"
                autoFocus
                onChange={(e) => update(row.key, "title", e.target.value)}
              />
              <input
                className="js-profile__input"
                value={row.period}
                placeholder="기간 (예: 2021.03–2025.02)"
                aria-label="기간"
                onChange={(e) => update(row.key, "period", e.target.value)}
              />
            </div>
            <textarea
              className="js-profile__input js-profile__input--area js-profile__input--short"
              value={row.did}
              placeholder="한 일"
              aria-label="한 일"
              onChange={(e) => update(row.key, "did", e.target.value)}
            />
            <textarea
              className="js-profile__input js-profile__input--area js-profile__input--short"
              value={row.results}
              placeholder="성과"
              aria-label="성과"
              onChange={(e) => update(row.key, "results", e.target.value)}
            />
            <input
              className="js-profile__input"
              value={row.tech}
              placeholder="사용 기술 (쉼표로 나눠 적기)"
              aria-label="사용 기술"
              onChange={(e) => update(row.key, "tech", e.target.value)}
            />
            <div className="js-profile__exp-actions">
              <button type="button" className="js-profile__mini-btn" onClick={() => remove(row.key)}>
                <TrashIcon />
                빼기
              </button>
              <button type="button" className="js-profile__mini-btn" onClick={() => setEditing(null)}>
                <SmallCheckIcon size={12} />
                완료
              </button>
            </div>
          </div>
        ) : (
          <div key={row.key} className="js-profile__exp">
            <div className="js-profile__exp-top">
              <button
                type="button"
                className="js-profile__exp-open"
                title="눌러서 고치기"
                onClick={() => setEditing(row.key)}
              >
                <b>{row.title.trim() || "(이름 없음)"}</b>
                {row.period.trim() && <span className="js-profile__sub">{row.period}</span>}
                <PencilIcon />
              </button>
              <SourceTag names={row.sources} kinds={kinds} />
              <button
                type="button"
                className="js-profile__icon-btn"
                aria-label="이 줄 빼기"
                onClick={() => remove(row.key)}
              >
                <TrashIcon />
              </button>
            </div>
            <dl>
              {DETAIL_ROWS.filter((d) => row[d.key].trim() !== "").map((d) => (
                <div key={d.key} className="js-profile__exp-row">
                  <dt>{d.label}</dt>
                  <dd>{row[d.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ),
      )}
      <button type="button" className="js-profile__mini-btn" onClick={add}>
        <PlusIcon size={12} />
        경력·프로젝트 추가
      </button>
    </div>
  );
}

export default ExperienceList;
