import { useState } from "react";
import Popover from "../../../components/common/Popover";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { createPropertyDef } from "../../../features/applications/propertyOps";
import { propertyTypeLabel } from "../../../features/applications/propertyTypes";
import { useApplications } from "../../../features/applications/store";
import type { PropertyType } from "../../../features/applications/types";
import PropertyTypeList from "./PropertyTypeList";

/**
 * "+ 속성 추가": 이름을 쓰고 종류를 누르면 만들어진다 (R28). 모든 카드에 함께 생긴다.
 * 이름을 비우면 종류 이름(예: "날짜")을 쓴다. Enter를 누르면 텍스트 종류로 만든다.
 */
function AddPropertyButton() {
  const { changeProperties } = useApplications();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const close = () => {
    setOpen(false);
    setName("");
  };

  const create = (type: PropertyType) => {
    const trimmed = name.trim();
    changeProperties({ type: "add-property", property: createPropertyDef(trimmed || propertyTypeLabel(type), type) });
    close();
  };

  return (
    <>
      <button ref={setAnchor} type="button" className="add-prop" aria-expanded={open} onClick={() => (open ? close() : setOpen(true))}>
        <PlusIcon />
        속성 추가
      </button>
      {open && anchor && (
        <Popover anchor={anchor} onClose={close} width={230} ariaLabel="속성 추가" className="prop-menu">
          <input
            className="pop-input"
            value={name}
            placeholder="속성 이름"
            aria-label="새 속성 이름"
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) create("text");
            }}
          />
          <div className="pop-caption">종류</div>
          <PropertyTypeList current={null} onPick={create} />
        </Popover>
      )}
    </>
  );
}

export default AddPropertyButton;
