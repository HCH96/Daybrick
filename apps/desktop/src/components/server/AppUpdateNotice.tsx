import { InfoIcon } from "../icons/ServerIcons";
import "../../pages/server-setup/wizard/WizardFields.css";
import "./ServerUpdateScreen.css";
import "./AppUpdateNotice.css";

interface AppUpdateNoticeProps {
  /** 서버 구조 번호 (읽기 전·읽지 못했으면 undefined, 구조 없음 null) */
  serverSchema: number | null | undefined;
  /** 앱의 최신 서버 구조 번호 (읽기 전이면 null) */
  appSchema: number | null;
}

function numberText(value: number | null | undefined): string {
  if (value === undefined) return "?";
  return String(value ?? 0);
}

/**
 * "앱을 업데이트하세요" 안내 (R24): 서버 번호가 앱보다 높을 때.
 * 설명만 보여주고 서버 기능은 쓰지 않는다 (세션은 ServerProvider가 내주지 않음). 설정 칸과 마법사가 함께 쓴다.
 */
function AppUpdateNotice({ serverSchema, appSchema }: AppUpdateNoticeProps) {
  return (
    <div className="app-update-notice">
      <div className="app-update-notice__row">
        <span className="app-update-notice__key">서버 구조</span>
        <span className="ver-pair">
          서버 <b>{numberText(serverSchema)}</b> / 앱 <b>{appSchema ?? "?"}</b>
        </span>
      </div>
      <div className="wiz-alert wiz-alert--info" role="status">
        <span className="wiz-alert__icon">
          <InfoIcon />
        </span>
        <div>
          <b>다른 PC에서 더 새로운 앱으로 서버를 업데이트했습니다</b>
          <p>이 PC의 앱을 최신 버전으로 바꿀 때까지 서버 기능은 꺼 둡니다. 로컬 기능은 그대로 쓸 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}

export default AppUpdateNotice;
