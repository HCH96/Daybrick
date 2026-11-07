import type { ComponentType } from "react";
import { NAV_LABELS } from "../../app/pageLabels";
import ServerSection from "./ServerSection";
import "./SettingsPage.css";

interface SettingsSectionDef {
  id: string;
  label: string; // 위쪽 칸 이름 줄에 보일 이름
  component: ComponentType;
}

/** 설정 칸 목록. 이후 기능은 여기에 칸을 추가한다 (D6). */
const sections: SettingsSectionDef[] = [{ id: "server", label: "서버 연결", component: ServerSection }];

/** 설정 화면: 제목 + 칸 이름 줄 + 칸들 */
function SettingsPage() {
  return (
    <div className="settings-page">
      <div>
        <h1 className="settings-page__title">{NAV_LABELS.settings}</h1>
        <div className="settings-page__sub">앱 설정</div>
      </div>

      <div className="settings-page__anchors">
        {sections.map((section, i) => (
          <span
            key={section.id}
            className={`settings-page__anchor${i === 0 ? " settings-page__anchor--on" : ""}`}
          >
            {section.label}
          </span>
        ))}
      </div>

      {sections.map(({ id, component: Section }) => (
        <Section key={id} />
      ))}
    </div>
  );
}

export default SettingsPage;
