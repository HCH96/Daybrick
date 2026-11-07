import { useState } from "react";
import Popover from "../../../components/common/Popover";
import { DotsIcon, ExternalLinkIcon } from "../../../components/icons/CommonIcons";
import type { BundleSource } from "../../../features/job-search/types";
import { openExternal } from "../../server-setup/wizard/openExternal";

interface PopupSourcesProps {
  sources: BundleSource[];
  /** 지원한 공고는 묶음에서 움직이지 않으므로 따로 보기 항목을 끈다 (D57) */
  locked: boolean;
  /** 다른 단추가 도는 중이면 ⋯ 메뉴를 끈다 */
  disabled: boolean;
  /** 지금 풀고 있는 공고 id */
  busyId: string | null;
  onUnbundle: (source: BundleSource) => void;
}

/**
 * 팝업 제목 아래 출처 칩 줄 (R92, R93): `출처 [넥슨 ↗ · 대표] [게임잡 ↗] [⋯]`.
 * 칩을 누르면 그 공고 링크를 열고, ⋯ 메뉴에서 공고마다 "<사이트> 따로 보기". 묶인 공고가 없으면 그리지 않는다
 */
function PopupSources({ sources, locked, disabled, busyId, onUnbundle }: PopupSourcesProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  if (sources.length < 2) return null;
  return (
    <div className="js-popup__src-row">
      <span className="js-popup__src-label">출처</span>
      {sources.map((s) => (
        <button
          key={s.postingId}
          type="button"
          className={`js-popup__src-chip${s.isRep ? " js-popup__src-chip--rep" : ""}`}
          disabled={!s.url}
          title={s.url ?? "링크 없음"}
          onClick={() => s.url && openExternal(s.url)}
        >
          {s.siteName}
          <ExternalLinkIcon size={12} />
          {s.isRep && <span>· 대표</span>}
          {busyId === s.postingId && <span>· 푸는 중…</span>}
        </button>
      ))}
      <button
        type="button"
        className="js-popup__src-dots"
        aria-label="출처 메뉴"
        disabled={disabled}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      >
        <DotsIcon />
      </button>
      {menuAnchor && (
        <Popover
          anchor={menuAnchor}
          onClose={() => setMenuAnchor(null)}
          placement="bottom-start"
          width={200}
          ariaLabel="출처 메뉴"
          className="js-popup__src-menu"
        >
          {sources.map((s) => (
            <button
              key={s.postingId}
              type="button"
              className="pop-row"
              disabled={locked || disabled}
              title={locked ? "지원한 공고는 묶음을 풀 수 없어요" : undefined}
              onClick={() => {
                setMenuAnchor(null);
                onUnbundle(s);
              }}
            >
              <span className="pop-row__label">{s.siteName} 따로 보기</span>
            </button>
          ))}
        </Popover>
      )}
    </div>
  );
}

export default PopupSources;
