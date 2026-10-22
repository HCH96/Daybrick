import { useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Popover from "../../../components/common/Popover";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import { canChangeType } from "../../../features/applications/propertyTypes";
import { useApplications } from "../../../features/applications/store";
import type { PropertyDef, PropertyRole } from "../../../features/applications/types";
import PropertyTypeList from "./PropertyTypeList";

interface PropertyMenuProps {
  property: PropertyDef;
  anchor: HTMLElement;
  onClose: () => void;
}

/** 역할 속성을 지우면 함께 사라지는 기능 (삭제 확인 문구에 덧붙인다, R33) */
const ROLE_DELETE_NOTE: Record<PropertyRole, string> = {
  priority: "카드의 우선순위 표시도 함께 사라져요.",
  result: "종료로 바꿀 때 결과를 고르는 칸도 뜨지 않아요.",
  company: "카드의 회사 표시도 함께 사라져요.",
};

/** 속성 이름을 누르면 뜨는 메뉴: 이름 바꾸기, 종류 바꾸기, 삭제 (R28·R33) */
function PropertyMenu({ property, anchor, onClose }: PropertyMenuProps) {
  const { changeProperties } = useApplications();
  const [name, setName] = useState(property.name);
  const [confirming, setConfirming] = useState(false);
  const typeLocked = !canChangeType(property);

  const deleteMessage = [
    "모든 카드에서 이 속성의 값이 지워지고, 되돌릴 수 없어요.",
    property.role ? ROLE_DELETE_NOTE[property.role] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Popover anchor={anchor} onClose={onClose} width={230} ariaLabel={`${property.name} 속성 편집`} className="prop-menu">
      <input
        className="pop-input"
        value={name}
        aria-label="속성 이름"
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setName(e.target.value);
          const trimmed = e.target.value.trim();
          // 빈 이름은 저장하지 않는다 (닫으면 마지막 이름이 남는다)
          if (trimmed !== "") changeProperties({ type: "rename-property", propertyId: property.id, name: trimmed });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) onClose();
        }}
      />
      <div className="pop-caption">종류</div>
      <PropertyTypeList
        current={property.type}
        disabled={typeLocked}
        onPick={(propertyType) => {
          changeProperties({ type: "change-property-type", propertyId: property.id, propertyType });
          onClose();
        }}
      />
      {typeLocked && <div className="pop-hint">앱 기능에 쓰이는 기본 속성이라 종류를 바꿀 수 없어요.</div>}
      <div className="pop-sep" />
      <button type="button" className="pop-row pop-row--danger" onClick={() => setConfirming(true)}>
        <span className="pop-row__label">
          <TrashIcon />
          속성 삭제
        </span>
      </button>

      {confirming && (
        <ConfirmDialog
          title={`"${property.name}" 속성을 삭제할까요?`}
          message={deleteMessage}
          confirmLabel="삭제"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onClose();
            changeProperties({ type: "delete-property", propertyId: property.id });
          }}
        />
      )}
    </Popover>
  );
}

export default PropertyMenu;
