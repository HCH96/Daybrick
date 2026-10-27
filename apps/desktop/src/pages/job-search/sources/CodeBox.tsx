import { useEffect, useState } from "react";
import { COPIED, COPY_FAILED } from "../../../features/job-search/messages";

interface CodeBoxProps {
  code: string;
  /** 화면 읽기 도구용 이름 (예: "게임잡 규칙") */
  label: string;
}

const FEEDBACK_MS = 1600;

/** 고정폭 코드 상자와 오른쪽 위 [복사] (R30). 목업 manage.css의 .code·.copy 기준 */
function CodeBox({ code, label }: CodeBoxProps) {
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  }

  return (
    <div className="js-code">
      <button type="button" className="js-code__copy" aria-label={`${label} 복사`} onClick={() => void copy()}>
        {copied === "ok" ? COPIED : copied === "fail" ? COPY_FAILED : "복사"}
      </button>
      <pre aria-label={label}>{code}</pre>
    </div>
  );
}

export default CodeBox;
