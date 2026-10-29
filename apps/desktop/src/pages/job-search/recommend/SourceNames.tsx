import type { BundleSource } from "../../../features/job-search/types";

interface SourceNamesProps {
  sources: BundleSource[];
  /** 카드·행마다 다른 자리 맞춤 클래스 (PostingCard.css·ArchivedList.css) */
  className: string;
}

/** 묶인 공고의 사이트 이름 한 줄 (R91): "출처: 스마일게이트 채용 · 게임잡". 출처가 2개 이상일 때만 */
function SourceNames({ sources, className }: SourceNamesProps) {
  if (sources.length < 2) return null;
  const text = `출처: ${sources.map((s) => s.siteName).join(" · ")}`;
  return (
    <div className={className} title={text}>
      {text}
    </div>
  );
}

export default SourceNames;
