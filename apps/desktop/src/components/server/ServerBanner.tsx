import { useState, type ReactNode } from "react";
import { useNavigation } from "../../app/navigation";
import { BANNER_TEXTS, type BannerStatus } from "../../features/server/messages";
import type { ServerStatus } from "../../features/server/types";
import { useServer } from "../../features/server/useServer";
import { ArrowUpIcon, CloudOffIcon, CrossIcon, InfoIcon, PauseIcon, UserIcon } from "../icons/ServerIcons";
import ResumeDialog from "./ResumeDialog";
import "./ServerBanner.css";

const BANNER_ICONS: Record<BannerStatus, ReactNode> = {
  "login-needed": <UserIcon size={16} />,
  "server-update": <ArrowUpIcon size={16} />,
  "app-update": <InfoIcon size={16} />,
  paused: <PauseIcon size={16} />,
  unreachable: <CloudOffIcon size={16} />,
};

function isBannerStatus(status: ServerStatus): status is BannerStatus {
  return status !== "connected" && status !== "off";
}

/**
 * 제목 표시줄 바로 아래 안내 띠 (R40, R41). 상태가 하나라 띠도 하나만 뜬다.
 * 띠를 누르면 해결할 곳으로 가고, [×]는 이번 실행 동안만 숨긴다.
 */
function ServerBanner() {
  const { status, dismissedBanners, dismissBanner, openUpdate } = useServer();
  const { navigate } = useNavigation();
  const [resumeOpen, setResumeOpen] = useState(false);

  const visible = isBannerStatus(status) && !dismissedBanners.includes(status);

  const onOpen = () => {
    if (status === "paused") {
      setResumeOpen(true);
      return;
    }
    // 서버 업데이트는 본문 자리에 업데이트 화면을 연다 (사이드바는 그대로)
    if (status === "server-update") {
      openUpdate();
      return;
    }
    // 그 밖(로그인·앱 업데이트·접속 불가)은 설정 → 서버 연결 칸에서 안내한다
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
            <CrossIcon size={16} />
          </button>
        </div>
      )}
      {resumeOpen && <ResumeDialog onClose={() => setResumeOpen(false)} />}
    </>
  );
}

export default ServerBanner;
