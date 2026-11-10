import type { ComponentType } from "react";
import { NAV_LABELS } from "../../app/pageLabels";
import { usePageIntent } from "../../app/pageIntent";
import AppSection from "./AppSection";
import ServerSection from "./ServerSection";
import SyncSection from "./SyncSection";
import { useSectionAnchors } from "./useSectionAnchors";
import "./SettingsPage.css";

interface SettingsSectionDef {
  id: string;
  label: string; // 위쪽 칸 이름 줄에 보일 이름
  component: ComponentType;
}

/** 설정 칸 목록. 이후 기능은 여기에 칸을 추가한다 (D6). */
const sections: SettingsSectionDef[] = [
  { id: "server", label: "서버 연결", component: ServerSection },
  { id: "sync", label: "데이터 동기화", component: SyncSection },
  { id: "app", label: "앱", component: AppSection },
];

const SECTION_IDS = sections.map((section) => section.id);

/** 설정 화면: 제목 + 칸 이름 줄(누르면 그 칸으로 이동) + 칸들 */
function SettingsPage() {
  const { activeId, register, scrollTo } = useSectionAnchors(SECTION_IDS);
  // 알림의 갈 곳 {page:"settings", tab}이면 그 칸까지 스크롤한다 (자동 업데이트 R8)
  usePageIntent("settings", (intent) => {
    if (intent.tab && SECTION_IDS.includes(intent.tab)) scrollTo(intent.tab);
  });
  return (
    <div className="settings-page">
      <div>
        <h1 className="settings-page__title">{NAV_LABELS.settings}</h1>
        <div className="settings-page__sub">앱 설정</div>
      </div>

      <nav className="settings-page__anchors" aria-label="설정 칸 바로 가기">
        {sections.map((section) => {
          const on = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              className={`settings-page__anchor${on ? " settings-page__anchor--on" : ""}`}
              aria-current={on ? "true" : undefined}
              onClick={() => scrollTo(section.id)}
            >
              {section.label}
            </button>
          );
        })}
      </nav>

      {sections.map(({ id, component: Section }) => (
        <div key={id} ref={register(id)} className="settings-page__section">
          <Section />
        </div>
      ))}
    </div>
  );
}

export default SettingsPage;
