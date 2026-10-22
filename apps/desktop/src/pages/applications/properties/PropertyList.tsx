import { useApplications } from "../../../features/applications/store";
import type { Application, PropertyDef } from "../../../features/applications/types";
import AddPropertyButton from "./AddPropertyButton";
import PropertyRow from "./PropertyRow";
import "./PropertyList.css";

interface PropertyListProps {
  application: Application;
  properties: readonly PropertyDef[];
}

/**
 * 상세 팝업의 속성 목록 (R28~R33). 순서는 속성 정의 순서를 따른다.
 * 제목·상태는 속성 목록에 없으므로 여기서 지울 수 없다 (R33). 전형 일정도 나오지 않는다 (R23).
 */
function PropertyList({ application, properties }: PropertyListProps) {
  const { setValue } = useApplications();

  return (
    <div className="prop-list">
      {properties.map((property) => (
        <PropertyRow
          key={property.id}
          property={property}
          value={application.values[property.id]}
          onChange={(value) => setValue(application.id, property.id, value)}
        />
      ))}
      <AddPropertyButton />
    </div>
  );
}

export default PropertyList;
