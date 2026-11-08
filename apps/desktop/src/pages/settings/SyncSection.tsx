import { RefreshIcon } from "../../components/icons/ServerIcons";
import { KINDS } from "../../features/sync/kinds";
import { SYNC_KINDS } from "../../features/sync/types";
import { useSync } from "../../features/sync/useSync";
import SyncKindRow from "./SyncKindRow";
import SyncNotice from "./SyncNotice";
import "./SyncSection.css";

/**
 * 설정의 "데이터 동기화" 칸 (R29). 켜기 스위치 + 막힌 이유 안내 + 종류별 상태.
 * 상태는 이 칸에만 보인다 (제목 표시줄에는 표시하지 않음).
 */
function SyncSection() {
  const { file, blocked, enable, disable, busy } = useSync();
  const enabled = file?.enabled ?? false;
  // 막혀 있으면 켤 수는 없지만, 켜져 있으면 끄는 것은 된다 (끄기는 아무 데이터도 바꾸지 않음, R25)
  const switchDisabled = file === null || busy || (!enabled && blocked !== null);

  const onToggle = () => {
    if (enabled) void disable();
    else void enable();
  };

  return (
    <section className="settings-card">
      <div className="settings-card__head">
        <span className="settings-card__icon">
          <RefreshIcon />
        </span>
        <h3 className="settings-card__title">
          데이터 동기화<small>플랜·캘린더·지원 관리·투데이를 내 서버에 올려 둠</small>
        </h3>
        <div className="settings-card__right">
          {busy && <span className="sync-section__busy">서버와 맞추는 중…</span>}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={`데이터 동기화 ${enabled ? "끄기" : "켜기"}`}
            className={`sync-switch${enabled ? " sync-switch--on" : ""}`}
            disabled={switchDisabled}
            onClick={onToggle}
          />
        </div>
      </div>

      {blocked !== null && <SyncNotice blocked={blocked} />}

      {file !== null && enabled && (
        <div className="settings-rows">
          {SYNC_KINDS.map((kind) => (
            <SyncKindRow key={kind} label={KINDS[kind].label} sync={file.kinds[kind]} />
          ))}
        </div>
      )}

      {file !== null && !enabled && blocked === null && (
        <div className="settings-card__pad sync-section__off">
          꺼져 있습니다. 켜면 종류마다 서버와 비교해 비어 있는 서버에 이 PC 내용을 올립니다. 꺼도 서버와 PC의 데이터는
          지우지 않습니다.
        </div>
      )}
    </section>
  );
}

export default SyncSection;
