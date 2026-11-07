import { useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Popover from "../../../components/common/Popover";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import { SITE_DELETE_NOTE } from "../../../features/job-search/messages";
import type { Site } from "../../../features/job-search/types";

interface SiteRowMenuProps {
  site: Site;
  anchor: HTMLElement;
  onClose: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

/** 사이트 줄 ⋯ 메뉴: 끄기/켜기, 삭제 (R31). 삭제 전에 확인 창을 띄운다 */
function SiteRowMenu({ site, anchor, onClose, onToggle, onDelete }: SiteRowMenuProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-end" width={180} ariaLabel={`${site.name} 메뉴`}>
      <button
        type="button"
        className="pop-row"
        onClick={() => {
          onToggle();
          onClose();
        }}
      >
        <span className="pop-row__label">{site.enabled ? "끄기" : "켜기"}</span>
      </button>
      <div className="pop-sep" />
      <button type="button" className="pop-row pop-row--danger" onClick={() => setConfirming(true)}>
        <span className="pop-row__label">
          <TrashIcon />
          삭제
        </span>
      </button>

      {confirming && (
        <ConfirmDialog
          title={`"${site.name}" 사이트를 삭제할까요?`}
          message="이 사이트는 더 수집하지 않고, 되돌릴 수 없어요"
          note={SITE_DELETE_NOTE}
          confirmLabel="삭제"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete();
            onClose();
          }}
        />
      )}
    </Popover>
  );
}

export default SiteRowMenu;
