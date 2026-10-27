import { loadErrorMessage } from "../../../features/job-search/messages";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import "../../server-setup/wizard/WizardShell.css";
import BalancePanel from "./BalancePanel";
import GmailPanel from "./GmailPanel";
import LimitsPanel from "./LimitsPanel";
import PricesPanel from "./PricesPanel";
import "./JobSettingsTab.css";

/** 설정 탭: 2열 판 네 개 (Gmail 연결, AI 한도, 기준 잔액, 모델 단가) */
function JobSettingsTab() {
  const { data, error, refresh } = useJobSearch();

  if (!data) {
    return (
      <div className="js-settings__state">
        {error ? loadErrorMessage(error) : "설정을 읽는 중…"}
        {error && (
          <button type="button" className="setup-btn" onClick={() => void refresh()}>
            다시 시도
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="js-settings">
      <GmailPanel />
      <LimitsPanel data={data} />
      <BalancePanel data={data} />
      <PricesPanel data={data} />
    </div>
  );
}

export default JobSettingsTab;
