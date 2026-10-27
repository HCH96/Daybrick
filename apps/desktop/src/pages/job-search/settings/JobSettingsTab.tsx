import { loadErrorMessage } from "../../../features/job-search/messages";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import "../../server-setup/wizard/WizardShell.css";
import BalancePanel from "./BalancePanel";
import LimitsPanel from "./LimitsPanel";
import PricesPanel from "./PricesPanel";
import { MailIcon } from "./SettingsIcons";
import "./JobSettingsTab.css";

/** 설정 탭: 2열 판 네 개 (Gmail 연결은 13단계에서 채운다) */
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
      <section className="js-settings__panel">
        <h3 className="js-settings__title">
          <MailIcon />
          Gmail 연결
        </h3>
        <p className="js-settings__desc">
          지원 건과 관련된 메일을 하루 한 번 확인해 상태 변경을 제안해요. 읽기 전용 권한만 요청해요.
        </p>
        <div className="js-settings__sub">Gmail 연결은 준비 중이에요.</div>
      </section>
      <LimitsPanel data={data} />
      <BalancePanel data={data} />
      <PricesPanel data={data} />
    </div>
  );
}

export default JobSettingsTab;
