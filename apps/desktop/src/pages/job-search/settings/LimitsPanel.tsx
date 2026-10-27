import { useState } from "react";
import { saveLimits } from "../../../features/job-search/api";
import {
  INVALID_DAILY_LIMIT,
  INVALID_MONTHLY_LIMIT,
  SAVED_MESSAGE,
  saveErrorMessage,
} from "../../../features/job-search/messages";
import { formatUsd, summarizeUsage } from "../../../features/job-search/usage";
import { useJobSearch, type JobSearchData } from "../../../features/job-search/useJobSearch";
import { SparkIcon } from "./SettingsIcons";
import SaveResult, { type SaveState } from "./SaveResult";

/** 설정 탭 AI 한도 판 (R73, R74): 하루 호출 수·월 사용액 */
function LimitsPanel({ data }: { data: JobSearchData }) {
  const { session, refresh } = useJobSearch();
  const [daily, setDaily] = useState(String(data.settings.dailyLimit));
  const [monthly, setMonthly] = useState(data.settings.monthlyLimitUsd.toFixed(2));
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveState>(null);
  const usage = summarizeUsage(data.settings, data.balanceRecords, data.aiCalls, new Date());

  async function save() {
    const dailyLimit = Number(daily);
    const monthlyLimitUsd = Number(monthly);
    if (!Number.isInteger(dailyLimit) || dailyLimit < 1) return setResult({ ok: false, text: INVALID_DAILY_LIMIT });
    if (!Number.isFinite(monthlyLimitUsd) || monthlyLimitUsd <= 0 || monthly.trim() === "") {
      return setResult({ ok: false, text: INVALID_MONTHLY_LIMIT });
    }
    setSaving(true);
    const saved = await saveLimits(session, { dailyLimit, monthlyLimitUsd });
    setSaving(false);
    setResult(saved.ok ? { ok: true, text: SAVED_MESSAGE } : { ok: false, text: saveErrorMessage(saved.error) });
    if (saved.ok) await refresh();
  }

  return (
    <section className="js-settings__panel">
      <h3 className="js-settings__title">
        <SparkIcon />
        AI 한도
      </h3>
      <p className="js-settings__desc">
        80%에 이르면 알림을 보내고, 넘으면 AI 호출을 멈춰요. 미룬 작업은 다음 날(월 한도는 다음 달) 이어서 처리해요.
      </p>
      <div className="js-settings__fields">
        <label className="js-settings__field">
          <span>하루 호출 수</span>
          <span className="js-settings__input">
            <input inputMode="numeric" value={daily} onChange={(e) => setDaily(e.target.value)} />
            <span className="js-settings__unit">회</span>
          </span>
        </label>
        <label className="js-settings__field">
          <span>월 사용액</span>
          <span className="js-settings__input">
            <input inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            <span className="js-settings__unit">USD</span>
          </span>
        </label>
      </div>
      <div className="js-settings__hint">
        오늘 {usage.todayCalls}/{usage.dailyLimit}회 · 이번 달 {formatUsd(usage.monthCostUsd)}/
        {formatUsd(usage.monthlyLimitUsd)}
      </div>
      <div className="js-settings__actions">
        <button type="button" className="setup-btn" disabled={saving} onClick={() => void save()}>
          저장
        </button>
        <SaveResult state={result} />
      </div>
    </section>
  );
}

export default LimitsPanel;
