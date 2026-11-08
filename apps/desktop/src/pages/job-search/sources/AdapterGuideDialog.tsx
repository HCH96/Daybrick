import { useState } from "react";
import { GUIDE_SECTIONS, type GuideBlock } from "../../../features/job-search/guideContent";
import CodeBox from "./CodeBox";
import "./AdapterGuideDialog.css";
import SourcesDialog from "./SourcesDialog";
import { BookIcon } from "./SourcesIcons";

interface AdapterGuideDialogProps {
  onClose: () => void;
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "code":
      return <CodeBox code={block.code} label={block.label} />;
    case "list":
      return (
        <ul className="js-guide__list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "keys":
      return (
        <table className="js-sources__table js-guide__keys">
          <thead>
            <tr>
              <th>키</th>
              <th>뜻</th>
              <th>필수</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.key}>
                <td className="js-guide__key">{row.key}</td>
                <td>{row.desc}</td>
                <td className={row.required ? undefined : "js-guide__faint"}>{row.required ? "필수" : "선택"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

/** 어댑터 작성 가이드 (R30): 왼쪽 목차, 오른쪽 고른 절의 본문 (형식·예시·프롬프트 틀·자주 나는 오류) */
function AdapterGuideDialog({ onClose }: AdapterGuideDialogProps) {
  const [sectionId, setSectionId] = useState(GUIDE_SECTIONS[0].id);
  const section = GUIDE_SECTIONS.find((s) => s.id === sectionId) ?? GUIDE_SECTIONS[0];

  return (
    <SourcesDialog title="어댑터 작성 가이드" icon={<BookIcon />} onClose={onClose}>
      <div className="js-guide">
        <nav className="js-guide__toc" aria-label="가이드 목차">
          {GUIDE_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`js-guide__toc-item${s.id === section.id ? " js-guide__toc-item--on" : ""}`}
              aria-current={s.id === section.id ? "true" : undefined}
              onClick={() => setSectionId(s.id)}
            >
              {s.title}
            </button>
          ))}
        </nav>
        <div className="js-guide__main">
          <h4>{section.title}</h4>
          {section.blocks.map((block, i) => (
            <Block key={`${section.id}-${i}`} block={block} />
          ))}
        </div>
      </div>
    </SourcesDialog>
  );
}

export default AdapterGuideDialog;
