import { ExternalLinkIcon } from "../../../components/icons/CommonIcons";
import type { BundleSource } from "../../../features/job-search/types";
import { openExternal } from "../../server-setup/wizard/openExternal";

interface PopupSourcesProps {
  sources: BundleSource[];
  /** 지원한 공고는 묶음에서 움직이지 않으므로 [따로 보기]를 끈다 (D57) */
  locked: boolean;
  /** 다른 단추가 도는 중이면 [따로 보기]를 끈다 */
  disabled: boolean;
  /** 지금 풀고 있는 공고 id */
  busyId: string | null;
  onUnbundle: (source: BundleSource) => void;
}

/** 팝업 머리 아래 출처 블록 (R92, R93): 사이트 이름 ↗ (대표) … [따로 보기]. 묶인 공고가 없으면 그리지 않는다 */
function PopupSources({ sources, locked, disabled, busyId, onUnbundle }: PopupSourcesProps) {
  if (sources.length < 2) return null;
  return (
    <div className="js-popup__sources">
      <span className="js-popup__sources-label">출처</span>
      <ul className="js-popup__sources-list">
        {sources.map((s) => (
          <li key={s.postingId} className="js-popup__source-row">
            <button
              type="button"
              className="js-popup__source-link"
              disabled={!s.url}
              title={s.url ?? "링크 없음"}
              onClick={() => s.url && openExternal(s.url)}
            >
              {s.siteName}
              <ExternalLinkIcon size={12} />
            </button>
            {s.isRep && <span className="js-popup__source-rep">(대표)</span>}
            <button
              type="button"
              className="setup-btn js-popup__source-split"
              disabled={locked || disabled}
              title={locked ? "지원한 공고는 묶음을 풀 수 없어요." : undefined}
              onClick={() => onUnbundle(s)}
            >
              {busyId === s.postingId ? "푸는 중…" : "따로 보기"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PopupSources;
