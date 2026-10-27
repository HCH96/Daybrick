import { useState } from "react";
import { addBalanceRecord } from "../../../features/job-search/api";
import {
  BALANCE_SAVED_MESSAGE,
  CALC_HINT,
  INVALID_BALANCE,
  saveErrorMessage,
} from "../../../features/job-search/messages";
import { balanceHistory, formatShortDate, formatUsd, summarizeUsage } from "../../../features/job-search/usage";
import { useJobSearch, type JobSearchData } from "../../../features/job-search/useJobSearch";
import { ClockIcon } from "./SettingsIcons";
import SaveResult, { type SaveState } from "./SaveResult";

/** 설정 탭 기준 잔액 판 (R76, R77): 예상 잔액, 기준 잔액 입력, 입력 기록 표 */
function BalancePanel({ data }: { data: JobSearchData }) {
  const { session, refresh } = useJobSearch();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveState>(null);
  const usage = summarizeUsage(data.settings, data.balanceRecords, data.aiCalls, new Date());
  const rows = balanceHistory(data.balanceRecords, data.aiCalls);

  async function submit() {
    const value = Number(amount);
    if (amount.trim() === "" || !Number.isFinite(value) || value < 0) {
      return setResult({ ok: false, text: INVALID_BALANCE });
    }
    setSaving(true);
    const saved = await addBalanceRecord(session, value);
    setSaving(false);
    if (!saved.ok) return setResult({ ok: false, text: saveErrorMessage(saved.error) });
    setAmount("");
    setResult({ ok: true, text: BALANCE_SAVED_MESSAGE });
    await refresh();
  }

  return (
    <section className="js-settings__panel">
      <h3 className="js-settings__title">
        <ClockIcon />
        기준 잔액
      </h3>
      <p className="js-settings__desc">
        Anthropic 콘솔에서 본 남은 크레딧을 넣으면, 그때부터 사용액을 $0부터 다시 세서 예상 잔액을 보여줘요.
      </p>
      <div className="js-settings__bal-now">
        {usage.baselineUsd === null || usage.estimatedUsd === null ? (
          "아직 넣은 기준 잔액이 없어요"
        ) : (
          <>
            예상 잔액 <b>{formatUsd(usage.estimatedUsd)}</b> = 기준 {formatUsd(usage.baselineUsd)} − 기준 이후{" "}
            {formatUsd(usage.sinceBaselineUsd)}
          </>
        )}
      </div>
      <form
        className="js-settings__bal-input"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <span className="js-settings__input">
          <input
            inputMode="decimal"
            placeholder="현재 잔액 (USD)"
            aria-label="현재 잔액 (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </span>
        <button type="submit" className="setup-btn setup-btn--primary" disabled={saving}>
          기준 잔액 입력
        </button>
      </form>
      <SaveResult state={result} />
      {rows.length > 0 && (
        <table className="js-settings__tbl">
          <thead>
            <tr>
              <th>입력한 날</th>
              <th>금액</th>
              <th>그때까지 기준 이후 사용액</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatShortDate(row.setAt)}</td>
                <td>{formatUsd(row.amountUsd)}</td>
                <td className="js-settings__sub">{row.spentUsd === null ? "현재 기준" : formatUsd(row.spentUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="js-settings__hint js-settings__hint--end">{CALC_HINT}</div>
    </section>
  );
}

export default BalancePanel;
