import { useEffect, useState } from "react";
import LineIcon from "../../components/icons/LineIcon";
import { autostartStatus, setAutostart, type AutostartStatus } from "../../features/background/api";
import "./SyncSection.css"; // 켜기 스위치(sync-switch) 모양을 같이 쓴다
import "./AppSection.css";

/** 전원 모양 아이콘 (앱 칸 머리) */
function PowerIcon() {
  return (
    <LineIcon size={16}>
      <path d="M12 3v8" />
      <path d="M6.3 7.3a8 8 0 1 0 11.4 0" />
    </LineIcon>
  );
}

/** 설정의 "앱" 칸: 윈도우 시작 시 자동 실행 스위치 (R14, R17, D6) */
function AppSection() {
  const [status, setStatus] = useState<AutostartStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    autostartStatus()
      .then((s) => {
        if (alive) setStatus(s);
      })
      .catch((e: unknown) => console.error("자동 시작 상태 읽기 실패", e));
    return () => {
      alive = false;
    };
  }, []);

  const enabled = status?.enabled ?? false;
  const available = status?.available ?? false;

  // 화면을 먼저 바꾸고, 윈도우 등록에 실패하면 원래대로 돌린다 (R17)
  const onToggle = async () => {
    if (status === null) return;
    const next = !status.enabled;
    setStatus({ ...status, enabled: next });
    setFailed(false);
    setBusy(true);
    try {
      await setAutostart(next);
    } catch (e: unknown) {
      console.error("자동 시작 설정 실패", e);
      setStatus({ ...status, enabled: !next });
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="settings-card">
      <div className="settings-card__head">
        <span className="settings-card__icon">
          <PowerIcon />
        </span>
        <h3 className="settings-card__title">
          앱<small>이 PC에서 Daybrick이 켜지는 방식</small>
        </h3>
      </div>

      <div className="settings-card__pad app-section__row">
        <div className="app-section__txt">
          <b>윈도우 시작 시 자동 실행</b>
          <p className="app-section__desc">켜 두면 로그인할 때 트레이에 숨은 채로 시작해요.</p>
          {status !== null && !available && <p className="app-section__note">개발 모드에서는 바꿀 수 없어요</p>}
          {failed && (
            <p className="app-section__error" role="alert">
              자동 시작 설정을 바꾸지 못했어요
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`윈도우 시작 시 자동 실행 ${enabled ? "끄기" : "켜기"}`}
          className={`sync-switch${enabled ? " sync-switch--on" : ""}`}
          disabled={status === null || !available || busy}
          onClick={() => void onToggle()}
        />
      </div>
    </section>
  );
}

export default AppSection;
