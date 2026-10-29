import type { ReactNode } from "react";
import { familyLabel } from "../../../features/job-search/filterRules";
import { NOT_EXTRACTED } from "../../../features/job-search/messages";
import { dateTime, scheduleLine } from "../../../features/job-search/postingFormat";
import type { PostingFields } from "../../../features/job-search/postingParse";
import { SparkIcon } from "./PopupIcons";

/** 목록 값: 없으면 null(— 표시) */
function list(items: string[]): ReactNode {
  if (items.length === 0) return null;
  return (
    <ul>
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

function withRaw(value: string | null, raw: string | null): ReactNode {
  if (!value && !raw) return null;
  return (
    <>
      {value ?? "날짜 불명확"}
      {raw && <span className="js-popup__raw">원문: {raw}</span>}
    </>
  );
}

function rows(f: PostingFields): [string, ReactNode][] {
  const years = f.experience.minYears;
  const experience = f.experience.text ?? (years === null ? null : years === 0 ? "경력 무관" : `${years}년 이상`);
  const schedule = f.schedule.map((s) => ({ line: scheduleLine(s), raw: s.text }));
  return [
    ["직무", f.role],
    ["직군", f.family === null ? null : familyLabel(f.family)],
    ["경력", experience],
    ["고용 형태", f.employment.join(", ") || null],
    ["근무지", f.location],
    [
      "기술스택",
      f.skills.length > 0 ? (
        <span className="js-popup__stack">
          {f.skills.map((s) => (
            <span key={s} className="js-popup__chip">
              {s}
            </span>
          ))}
        </span>
      ) : null,
    ],
    ["자격 요건", list(f.requirements)],
    ["우대사항", list(f.preferred)],
    ["지원 마감", withRaw(dateTime(f.deadline.date, f.deadline.time), f.deadline.text)],
    [
      "전형 일정",
      schedule.length > 0
        ? schedule.map((s, i) => (
            <span key={i} className="js-popup__sched">
              {s.line}
              {s.raw && <span className="js-popup__raw">원문: {s.raw}</span>}
            </span>
          ))
        : null,
    ],
  ];
}

/** 추출 항목 이름·값 (R48, R50). 날짜는 정리한 값 아래 흐린 "원문: …", 없는 항목은 "—" */
function FieldTable({ fields }: { fields: PostingFields | null }) {
  return (
    <section>
      <h3 className="js-popup__sec-title">
        <SparkIcon />
        추출 항목
      </h3>
      {!fields ? (
        <p className="js-popup__empty">{NOT_EXTRACTED}</p>
      ) : (
        <dl className="js-popup__fields">
          {rows(fields).map(([name, value]) => (
            <div key={name} className="js-popup__field">
              <dt>{name}</dt>
              {value === null ? <dd className="js-popup__dash">—</dd> : <dd>{value}</dd>}
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default FieldTable;
