import { useNavigation } from "../../app/navigation";
import LineIcon from "../../components/icons/LineIcon";
import "../server-setup/wizard/WizardShell.css";
import "./JobSearchDisconnected.css";

function CloudIcon() {
  return (
    <LineIcon size={24}>
      <path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z" />
    </LineIcon>
  );
}

function LinkIcon() {
  return (
    <LineIcon size={16}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </LineIcon>
  );
}

/** 서버 연결·로그인이 안 됐을 때 탭 대신 보이는 안내 (R2). 단추는 설정의 서버 연결로 간다. */
function JobSearchDisconnected() {
  const { navigate } = useNavigation();
  return (
    <div className="job-search-disconnected">
      <span className="job-search-disconnected__icon" aria-hidden="true">
        <CloudIcon />
      </span>
      <h2>서버에 연결해야 쓸 수 있어요</h2>
      <p>
        구직 관리는 공고 수집과 AI 채점을 서버에서 해요. 서버를 연결하고 로그인하면 추천 공고가 여기에 나와요.
      </p>
      <button type="button" className="setup-btn setup-btn--primary" onClick={() => navigate("settings")}>
        <LinkIcon />
        서버 연결하기
      </button>
    </div>
  );
}

export default JobSearchDisconnected;
