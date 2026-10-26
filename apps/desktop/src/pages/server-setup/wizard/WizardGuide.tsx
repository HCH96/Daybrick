import { ExternalLinkIcon } from "../../../components/icons/CommonIcons";
import { WarnIcon } from "../../../components/icons/ServerIcons";
import type { StepGuide } from "./guides";
import { openExternal } from "./openExternal";

/** 오른쪽 가이드: 이 단계에서 할 일 번호 목록 + 맨 아래 주의 상자 (R7, R10) */
function WizardGuide({ guide }: { guide: StepGuide }) {
  return (
    <aside className="wiz-guide" aria-label="가이드">
      <div className="wiz-guide__head">가이드 · {guide.stepName}</div>
      <h3 className="wiz-guide__title">이 단계에서 할 일</h3>
      <ol className="wiz-guide__list">
        {guide.items.map((item) => (
          <li key={item.title}>
            <div>
              <b>{item.title}</b>
              {item.desc && <span>{item.desc}</span>}
              {item.link && (
                <button type="button" className="wiz-guide__link" onClick={() => item.link && openExternal(item.link.url)}>
                  {item.link.label}
                  <ExternalLinkIcon size={13} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
      {guide.tip && (
        <div className="wiz-guide__tip">
          <b>
            <WarnIcon size={15} />
            {guide.tip.title}
          </b>
          {guide.tip.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}
    </aside>
  );
}

export default WizardGuide;
