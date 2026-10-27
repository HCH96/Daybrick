import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import type { CollectTestResult, TestSample } from "../../../features/job-search/api";
import {
  TESTING,
  TEST_IDLE,
  missingVarsMessage,
  testFailedMessage,
  testPassedMessage,
} from "../../../features/job-search/messages";
import { AlertIcon } from "./SourcesIcons";

/** 시험 수집 상태 (AddSiteDialog가 들고 있다) */
export type TestState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "error"; text: string }
  | { kind: "done"; result: CollectTestResult };

const FIELD_LABELS: Record<string, string> = {
  title: "제목",
  link: "링크",
  company: "회사",
  id: "공고 번호",
  duty: "직무",
  body: "목록 본문",
};

const FIELD_ORDER = ["title", "link", "company", "id", "duty", "body"];

function chipTone(count: number, total: number): string {
  if (count === total) return "green";
  return count === 0 ? "red" : "amber";
}

function bodyText(sample: TestSample): string {
  if (sample.bodyError) return `받지 못함 (${sample.bodyError})`;
  if (sample.bodyChars === null) return "상세 규칙 없음";
  const images = sample.images ? ` · 이미지 ${sample.images}장` : "";
  return `글 ${sample.bodyChars.toLocaleString()}자${images}`;
}

/** 상대 주소처럼 짧게: 주소의 경로만 */
function shortLink(link: string | null): string {
  if (!link) return "없음";
  try {
    const url = new URL(link);
    return `${url.pathname}${url.search}`;
  } catch {
    return link;
  }
}

function Failure({ text, items }: { text: string; items?: string[] }) {
  return (
    <div className="js-test__line js-test__line--bad" role="alert">
      <AlertIcon />
      <div>
        <span>{text}</span>
        {items && items.length > 0 && (
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** 시험 수집 결과 (R29): 성공 줄, 항목별 읽힘 칩, 처음 5개 표. 실패면 이유 */
function TestResult({ state }: { state: TestState }) {
  if (state.kind === "idle") return <p className="js-test__idle">{TEST_IDLE}</p>;
  if (state.kind === "running") {
    return (
      <p className="js-test__idle" role="status">
        <span className="js-sources__spinner" aria-hidden="true" />
        {TESTING}
      </p>
    );
  }
  if (state.kind === "error") return <Failure text={state.text} />;

  const result = state.result;
  if (!result.ok) {
    if (result.reason === "invalid-rule") return <Failure text="규칙 형식이 맞지 않아요" items={result.errors} />;
    return <Failure text={missingVarsMessage(result.missing)} />;
  }

  const fields = FIELD_ORDER.filter((key) => key in result.fields);
  return (
    <>
      {result.passed ? (
        <div className="js-test__line js-test__line--ok" role="status">
          <SmallCheckIcon size={16} />
          <span>{testPassedMessage(result.read, result.ms)}</span>
        </div>
      ) : (
        <Failure text={testFailedMessage(result.problem)} />
      )}
      <div className="js-test__chips">
        <span className="js-sources__chip js-sources__chip--green">형식 검사 통과</span>
        {result.read > 0 &&
          fields.map((key) => (
            <span key={key} className={`js-sources__chip js-test__chip--${chipTone(result.fields[key], result.read)}`}>
              {FIELD_LABELS[key] ?? key} {result.fields[key]}/{result.read}
            </span>
          ))}
      </div>
      {result.sample.length > 0 && (
        <>
          <div className="js-test__sub">처음 {result.sample.length}개</div>
          <table className="js-sources__table js-test__table">
            <thead>
              <tr>
                <th>제목</th>
                <th>회사</th>
                <th>본문</th>
                <th>링크</th>
              </tr>
            </thead>
            <tbody>
              {result.sample.map((sample, i) => (
                <tr key={`${sample.link ?? ""}-${i}`}>
                  <td>{sample.title ?? <span className="js-test__faint">없음</span>}</td>
                  <td>{sample.company ?? <span className="js-test__faint">없음</span>}</td>
                  <td className={sample.bodyError ? "js-test__bad" : "js-test__faint"}>{bodyText(sample)}</td>
                  <td className="js-test__faint" title={sample.link ?? undefined}>
                    {shortLink(sample.link)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

export default TestResult;
