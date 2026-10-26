import { useState, type ReactNode } from "react";
import { useNavigation } from "../../app/navigation";
import { BANNER_TEXTS, type BannerStatus } from "../../features/server/messages";
import type { ServerStatus } from "../../features/server/types";
import { useServer } from "../../features/server/useServer";
import { ArrowUpIcon, CloudOffIcon, CrossIcon, InfoIcon, PauseIcon, UserIcon } from "../icons/ServerIcons";
import ResumeDialog from "./ResumeDialog";
import "./ServerBanner.css";

const BANNER_ICONS: Record<BannerStatus, ReactNode> = {
  "login-needed": <UserIcon size={15} />,
  "server-update": <ArrowUpIcon size={15} />,
  "app-update": <InfoIcon size={15} />,
  paused: <PauseIcon size={15} />,
  unreachable: <CloudOffIcon size={15} />,
};

function isBannerStatus(status: ServerStatus): status is BannerStatus {
  return status !== "connected" && status !== "off";
}

/**
 * 제목 표시줄 바로 아래 안내 띠 (R40, R41). 상태가 하나라 띠도 하나만 뜬다.
 * 띠를 누르면 해결할 곳으로 가고, [×]는 이번 실행 동안만 숨긴다.
 */
function ServerBanner() {
  const { status, dismissedBanners, dismissBanner } = useServer();
  const { navigate } = useNavigation();
  const [resumeOpen, setResumeOpen] = useState(false);

  const visible = isBannerStatus(status) && !dismissedBanners.includes(status);

  const onOpen = () => {
    if (status === "paused") {
      setResumeOpen(true);
      return;
    }
    // 서버 업데이트 화면은 8단계에서 붙인다. 그 전까지는 설정 → 서버 연결로 간다.
    navigate("settings");
  };

  return (
    <>
      {visible && (
        <div className={`server-banner server-banner--${BANNER_TEXTS[status].tone}`} role="status">
          <button type="button" className="server-banner__main" onClick={onOpen}>
            {BANNER_ICONS[status]}
            <span className="server-banner__msg">{BANNER_TEXTS[status].message}</span>
            <span className="server-banner__go">{BANNER_TEXTS[status].link}</span>
          </button>
          <button
            type="button"
            className="server-banner__close"
            aria-label="안내 닫기"
            title="이번 실행 동안 숨기기"
            onClick={() => dismissBanner(status)}
          >
            <CrossIcon size={15} />
          </button>
        </div>
      )}
      {resumeOpen && <ResumeDialog onClose={() => setResumeOpen(false)} />}
    </>
  );
}

export default ServerBanner;
