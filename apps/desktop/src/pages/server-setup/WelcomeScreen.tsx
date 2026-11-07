import { ServerIcon } from "../../components/icons/ServerIcons";
import { useServer } from "../../features/server/useServer";
// 버튼 모양(setup-btn)은 마법사와 함께 쓴다
import "./wizard/WizardShell.css";
import "./WelcomeScreen.css";

/** 미리 알려주는 준비물 (자세한 내용은 마법사 ① 준비 단계) */
const NEEDS = ["Supabase 계정", "Anthropic API 키", "Google 계정"];

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
      <h1>Daybrick</h1>
      <p className="welcome__intro">
        일정·지원·집중을 한곳에서. 내 서버를 연결하면 알림·구직 관리·기기 동기화를 씁니다
      </p>

      <div className="welcome__actions">
        <button type="button" className="setup-btn setup-btn--primary setup-btn--lg" onClick={openSetup}>
          <ServerIcon />
          서버 연결 시작
        </button>
        <button type="button" className="setup-btn setup-btn--ghost" onClick={dismiss}>
          나중에 하기
        </button>
      </div>

      <div className="welcome__notes">
        <span>준비물: {NEEDS.join(" · ")}</span>
        <span>나중에 해도 이 PC 안의 기능은 그대로 쓰고, Settings → 서버 연결에서 언제든 시작할 수 있습니다</span>
      </div>
    </div>
  );
}

export default WelcomeScreen;
