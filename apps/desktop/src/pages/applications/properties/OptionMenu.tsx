import { useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Popover from "../../../components/common/Popover";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import { countOptionUsage } from "../../../features/applications/propertyOps";
import { useApplications } from "../../../features/applications/store";
import type { PropertyDef, PropertyOption } from "../../../features/applications/types";
import ColorPalette from "./ColorPalette";

interface OptionMenuProps {
  property: PropertyDef;
  option: PropertyOption;
  anchor: HTMLElement;
  onClose: () => void;
}

/** 항목 옆 ··· 메뉴: 이름 바꾸기, 8색 고르기, 삭제 (R30, 목업 "선택 항목") */
function OptionMenu({ property, option, anchor, onClose }: OptionMenuProps) {
  const { state, changeProperties } = useApplications();
  const [name, setName] = useState(option.name);
  const [confirming, setConfirming] = useState(false);

  const usage = state.kind === "ready" ? countOptionUsage(state.data.applications, property, option.id) : 0;

  return (
    <Popover anchor={anchor} onClose={onClose} placement="right-start" width={220} ariaLabel={`${option.name} 항목 편집`} className="option-menu">
      <input
        className="pop-input"
        value={name}
        aria-label="항목 이름"
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setName(e.target.value);
          const trimmed = e.target.value.trim();
          // 빈 이름은 저장하지 않는다 (닫으면 마지막 이름이 남는다)
          if (trimmed !== "") {
            changeProperties({ type: "update-option", propertyId: property.id, optionId: option.id, patch: { name: trimmed } });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) onClose();
        }}
      />
      <div className="pop-caption">색</div>
      <ColorPalette
        value={option.color}
        onChange={(color) => changeProperties({ type: "update-option", propertyId: property.id, optionId: option.id, patch: { color } })}
      />
      <div className="pop-sep" />
      <button type="button" className="pop-row pop-row--danger" onClick={() => setConfirming(true)}>
        <span className="pop-row__label">
          <TrashIcon />
          항목 삭제
        </span>
      </button>

      {confirming && (
        <ConfirmDialog
          title={`"${option.name}" 항목을 삭제할까요?`}
          message={
            usage > 0
              ? `이 항목을 고른 카드 ${usage}개에서도 빠지고, 되돌릴 수 없어요.`
              : "되돌릴 수 없어요."
          }
          confirmLabel="삭제"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            changeProperties({ type: "delete-option", propertyId: property.id, optionId: option.id });
            onClose();
          }}
        />
      )}
    </Popover>
  );
}

export default OptionMenu;
