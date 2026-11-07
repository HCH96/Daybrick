import LineIcon from "../../../components/icons/LineIcon";
import { CALC_NOTE, loadErrorMessage } from "../../../features/job-search/messages";
import { formatUsd, percentOf, summarizeUsage, WARN_PERCENT } from "../../../features/job-search/usage";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import "./UsageLine.css";

function AlertIcon() {
  return (
    <LineIcon size={12}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </LineIcon>
  );
}

function Meter({ label, value, of, percent }: { label: string; value: string; of: string; percent: number }) {
  return (
    <div className="usage-line__meter">
      <div className="usage-line__meter-top">
        <span className="usage-line__k">{label}</span>
        <b>{value}</b>
        <span className="usage-line__of">/ {of}</span>
      </div>
      <div className="usage-line__bar">
        <i className={percent >= WARN_PERCENT ? "usage-line__fill--warn" : undefined} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** 추천 공고 탭 상태 상자의 1줄 (R75, R77): 오늘 호출·이번 달 사용액 막대, 기준 잔액 → 예상 잔액. 상자 틀은 RecommendTab */
function UsageLine() {
  const { data, error, refresh } = useJobSearch();

  if (!data) {
    return (
      <div className="usage-line__row">
        <span className="usage-line__msg">{error ? loadErrorMessage(error) : "사용량을 읽는 중…"}</span>
        {error && (
          <button type="button" className="usage-line__retry" onClick={() => void refresh()}>
            다시 시도
          </button>
        )}
      </div>
    );
  }

  const usage = summarizeUsage(data.settings, data.balanceRecords, data.aiCalls, new Date());
  return (
    <div className="usage-line__row">
        <Meter
          label="오늘 호출"
          value={String(usage.todayCalls)}
          of={`${usage.dailyLimit}회`}
          percent={percentOf(usage.todayCalls, usage.dailyLimit)}
        />
        <Meter
          label="이번 달 사용액"
          value={formatUsd(usage.monthCostUsd)}
          of={formatUsd(usage.monthlyLimitUsd)}
          percent={percentOf(usage.monthCostUsd, usage.monthlyLimitUsd)}
        />
        <div className="usage-line__balance">
          {usage.baselineUsd === null || usage.estimatedUsd === null ? (
            <span className="usage-line__k">기준 잔액 없음 · 설정 탭에서 넣으면 예상 잔액이 나와요</span>
          ) : (
            <>
              <span className="usage-line__k">기준 잔액</span>
              <b>{formatUsd(usage.baselineUsd)}</b>
              <span className="usage-line__arrow">−</span>
              <span className="usage-line__k">기준 이후</span>
              <b>{formatUsd(usage.sinceBaselineUsd)}</b>
              <span className="usage-line__arrow">=</span>
              <span className="usage-line__est">
                <span className="usage-line__k">예상 잔액</span> <b>{formatUsd(usage.estimatedUsd)}</b>
              </span>
            </>
          )}
        </div>
        <span className="usage-line__note">
          <AlertIcon />
          {CALC_NOTE}
        </span>
    </div>
  );
}

export default UsageLine;
