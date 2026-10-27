import { Fragment } from "react";
import { ChevronRightIcon } from "../../../components/icons/CommonIcons";
import type { FlowCounts } from "../../../features/job-search/filterRules";

interface Step {
  name: string;
  sub: string;
  ai: boolean;
  count: (c: FlowCounts) => number;
  after: (c: FlowCounts) => string | null;
}

const STEPS: Step[] = [
  { name: "수집", sub: "이번 주 새 공고", ai: false, count: (c) => c.collected,
    after: (c) => (c.unprocessed > 0 ? `처리 전 ${c.unprocessed}` : null) },
  { name: "1차 필터", sub: "제목·회사·직무로 거름", ai: false, count: (c) => c.firstPassed, after: () => "통과" },
  { name: "항목 추출 + 인젝션 검사", sub: "Haiku 5.5", ai: true, count: (c) => c.extractedOk, after: () => "정상" },
  { name: "2차 필터", sub: "추출 항목으로 거름", ai: false, count: (c) => c.secondPassed, after: () => "통과" },
  {
    name: "적합도 채점",
    sub: "Opus 5.5",
    ai: true,
    count: (c) => c.scored,
    after: (c) => (c.waiting > 0 ? `완료 · 대기 ${c.waiting}` : "완료"),
  },
];

interface FlowLineProps {
  /** 읽는 중이거나 읽지 못했으면 null (숫자 자리에 –) */
  counts: FlowCounts | null;
}

/** 처리 순서 줄 (R41): 수집 → 1차 → 추출 → 2차 → 채점, 이번 주 단계별 개수. AI 단계는 보라 테두리 */
function FlowLine({ counts }: FlowLineProps) {
  return (
    <div className="js-filters__flow" aria-label="처리 순서">
      {STEPS.map((step, i) => {
        const after = counts ? step.after(counts) : null;
        return (
          <Fragment key={step.name}>
            {i > 0 && (
              <span className="js-filters__flow-arrow" aria-hidden="true">
                <ChevronRightIcon size={18} />
              </span>
            )}
            <div className={`js-filters__flow-step${step.ai ? " js-filters__flow-step--ai" : ""}`}>
              <b>{step.name}</b>
              <span className="js-filters__sub js-filters__sub--block">{step.sub}</span>
              <span className="js-filters__n">{counts ? step.count(counts) : "–"}</span>
              {after && <span className="js-filters__sub"> {after}</span>}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

export default FlowLine;
