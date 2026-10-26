import type { ReactNode } from "react";
import { GoogleIcon, KeyIcon, ServerIcon } from "../../components/icons/ServerIcons";
import { useServer } from "../../features/server/useServer";
// 버튼 모양(setup-btn)은 마법사와 함께 쓴다
import "./wizard/WizardShell.css";
import "./WelcomeScreen.css";

/** 미리 알려주는 준비물 (누를 수 없음) */
const NEEDS: { icon: ReactNode; title: string; sub: string }[] = [
  { icon: <ServerIcon size={22} />, title: "Supabase 계정", sub: "무료 플랜으로 충분" },
  { icon: <KeyIcon size={22} />, title: "Anthropic API 키", sub: "쓴 만큼 요금" },
  { icon: <GoogleIcon size={22} />, title: "Google 계정", sub: "로그인에 사용" },
];

/** 첫 실행 안내: 연결 정보가 없고 [나중에 하기]를 누른 적이 없을 때 창 전체에 뜬다 (R1, R2) */
function WelcomeScreen() {
  const { openSetup, updateConfig } = useServer();

  const dismiss = () => {
    updateConfig({ welcomeDismissed: true }).catch((e: unknown) =>
      console.error("첫 실행 안내 닫기를 저장하지 못함", e),
    );
  };

  return (
    <div className="welcome">
      <div className="welcome__brick" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <h1>Daybrick에 오신 것을 환영합니다</h1>
      <p className="welcome__intro">
        일정·지원·집중 관리를 한곳에서. 내 Supabase 서버를 연결하면 알림, 구직 관리, 다른 기기 동기화를 쓸 수
        있습니다.
      </p>

      <div className="welcome__actions">
        <button type="button" className="setup-btn setup-btn--primary setup-btn--lg" onClick={openSetup}>
          <ServerIcon />
          서버 연결 시작
        </button>
        <button type="button" className="setup-btn setup-btn--ghost" onClick={dismiss}>
          나중에 하기
        </button>
        <span className="welcome__later-note">
          나중에 하면 이 PC 안에서만 쓰는 기능은 그대로 쓸 수 있고, 설정 → 서버 연결에서 언제든 시작할 수 있습니다.
        </span>
      </div>

      <div className="welcome__needs">
        {NEEDS.map((need) => (
          <div key={need.title} className="welcome__need">
            {need.icon}
            <div>
              {need.title}
              <small>{need.sub}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WelcomeScreen;
