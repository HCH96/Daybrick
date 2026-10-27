import type { NewOption } from "../applications/reducer";
import type { Application, PropertyDef, PropertyOption, PropertyValue } from "../applications/types";
import type { PostingDetail } from "./postingApi";
import type { VagueEvent } from "./scheduleSuggest";

/**
 * 공고 → 지원 관리 카드 (R54, R56). 화면과 무관한 순수 함수만 둔다.
 * 속성은 이름으로 찾고, 없으면(사용자가 지웠거나 이름을 바꿨으면) 비워 둔다.
 * 선택 속성에 맞는 항목이 없으면 새 항목을 만들어 options로 돌려준다.
 */

export interface BuiltCard {
  card: Application;
  options: NewOption[];
}

/** 카드 본문에 쓰는 공고 내용 */
function bodyMarkdown(posting: PostingDetail, vague: VagueEvent[]): string {
  const parts: string[] = [];
  const list = (title: string, items: string[]) => {
    if (items.length > 0) parts.push(`## ${title}\n${items.map((t) => `- ${t}`).join("\n")}`);
  };
  list("자격 요건", posting.fields?.requirements ?? []);
  list("우대 사항", posting.fields?.preferred ?? []);
  if (posting.score) {
    const summary = posting.score.summary ? `\n${posting.score.summary}` : "";
    parts.push(`## 적합도 요약\n${posting.score.score}점${summary}`);
  }
  list(
    "날짜가 정확하지 않은 일정",
    vague.map((v) => `${v.label} — “${v.text}”`),
  );
  if (posting.url) parts.push(`[공고 원문](${posting.url})`);
  return parts.join("\n\n");
}

/** 경력 구분 항목 이름: 신입·경력 무관은 최소 연수 0 (D36) */
function careerName(posting: PostingDetail): string | null {
  const exp = posting.fields?.experience;
  if (!exp) return null;
  const text = exp.text ?? "";
  if (text.includes("무관")) return "무관";
  if (exp.minYears !== null && exp.minYears > 0) return "경력";
  if (exp.minYears === 0 || text.includes("신입")) return "신입";
  return text.includes("경력") ? "경력" : null;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** 이름이 같은 항목. loose면 없을 때 이름이 들어 있는 항목(예: "정규직(수습 3개월)" → 정규직) */
function findOption(options: PropertyOption[], name: string, loose: boolean): PropertyOption | undefined {
  const exact = options.find((o) => same(o.name, name));
  if (exact || !loose) return exact;
  return options.find((o) => o.name.trim() !== "" && name.includes(o.name.trim()));
}

/** 속성 종류에 맞춰 값을 만든다. 새 선택 항목이 필요하면 added에 넣는다 */
function valueFor(
  property: PropertyDef,
  names: string[],
  loose: boolean,
  newId: () => string,
  added: NewOption[],
): PropertyValue {
  const words = names.map((n) => n.trim()).filter((n) => n !== "");
  if (words.length === 0) return null;
  if (property.type === "text" || property.type === "url") return words.join(", ");
  if (property.type !== "select" && property.type !== "multi-select") return null;

  const ids: string[] = [];
  for (const word of property.type === "select" ? words.slice(0, 1) : words) {
    const pool = [...property.options, ...added.filter((a) => a.propertyId === property.id).map((a) => a.option)];
    let option = findOption(pool, word, loose);
    if (!option) {
      option = { id: newId(), name: word, color: "gray" };
      added.push({ propertyId: property.id, option });
    }
    if (!ids.includes(option.id)) ids.push(option.id);
  }
  return property.type === "select" ? (ids[0] ?? null) : ids;
}

/**
 * 상태 "지원 준비" 카드. 회사·직무·공고 링크·경력 구분·고용 형태 속성을 채우고 본문에 요약을 넣는다.
 * id·시각은 부르는 쪽에서 넣는다 (서버 지원 건의 card_id로 먼저 쓰기 때문).
 */
export function buildCard(
  posting: PostingDetail,
  properties: PropertyDef[],
  vague: VagueEvent[],
  ids: { cardId: string; serverId: string; now: string; newId: () => string },
): BuiltCard {
  // [속성 이름, 넣을 값, 비슷한 항목 이름도 같은 것으로 볼지]
  const sources: [string, string[], boolean][] = [
    ["회사", posting.company ? [posting.company] : [], false],
    ["직무", posting.fields?.role ? [posting.fields.role] : [], false],
    ["공고 링크", posting.url ? [posting.url] : [], false],
    ["경력 구분", [careerName(posting) ?? ""], true],
    ["고용 형태", posting.fields?.employment ?? [], true],
  ];
  const options: NewOption[] = [];
  const values: Record<string, PropertyValue> = {};
  for (const [name, words, loose] of sources) {
    const property = properties.find((p) => same(p.name, name));
    if (!property) continue;
    const value = valueFor(property, words, loose, ids.newId, options);
    if (value !== null) values[property.id] = value;
  }
  return {
    card: {
      id: ids.cardId,
      title: posting.title ?? "",
      status: "preparing",
      stage: null,
      values,
      events: [],
      body: bodyMarkdown(posting, vague),
      createdAt: ids.now,
      updatedAt: ids.now,
      jobLink: { serverId: ids.serverId },
    },
    options,
  };
}

/** 메일 판별에 쓰지 않는 채용 플랫폼·지원 대행 도메인 (여기서 온 메일은 회사를 가릴 수 없다) */
const PLATFORMS = [
  "gamejob.co.kr",
  "saramin.co.kr",
  "jobkorea.co.kr",
  "wanted.co.kr",
  "jumpit.co.kr",
  "programmers.co.kr",
  "rocketpunch.com",
  "incruit.com",
  "catch.co.kr",
  "albamon.com",
  "work.go.kr",
  "linkedin.com",
  "indeed.com",
  "remember.co.kr",
  "greetinghr.com",
  "ninehire.com",
  "recruiter.co.kr",
  "notion.site",
  "google.com",
];

/** 두 단계 국가 도메인 (`nexon.co.kr`처럼 끝 세 마디를 남긴다) */
const SECOND_LEVEL = ["co", "or", "ac", "go", "ne", "re", "pe"];

/**
 * 공고 링크에서 메일 판별용 도메인을 뽑는다 (예: careers.nexon.com → nexon.com).
 * 채용 플랫폼 주소이거나 주소가 없으면 null.
 */
export function mailDomain(url: string | null): string | null {
  if (!url) return null;
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (!host.includes(".") || /^[\d.]+$/.test(host)) return null;
  if (PLATFORMS.some((p) => host === p || host.endsWith(`.${p}`))) return null;
  const labels = host.split(".");
  const keep = labels.length >= 3 && SECOND_LEVEL.includes(labels[labels.length - 2]) ? 3 : 2;
  return labels.slice(-keep).join(".");
}
