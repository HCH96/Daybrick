import { useCallback, useEffect, useState } from "react";
import { SmallCheckIcon } from "../../components/icons/CommonIcons";
import { RefreshIcon } from "../../components/icons/ServerIcons";
import { KINDS } from "../../features/sync/kinds";
import type { ChoiceInfo } from "../../features/sync/resolve";
import type { SyncKind } from "../../features/sync/types";
import { useSync } from "../../features/sync/useSync";
import SettingsDialog from "./SettingsDialog";
import { formatSyncTime } from "./syncTime";

function sideText(time: string | null, device: string): string {
  const shown = time ? formatSyncTime(time) : null;
  return `${shown ?? "알 수 없음"} · ${device}`;
}

/**
 * "선택 필요" 종류의 고르기 창 (R15, R19, R20).
 * 양쪽 마지막 수정 시각·기기 이름을 보여주고 PC 내용 남기기(추천) / 서버 내용 받기 중 고른다.
 * 이 PC가 비어 있고 서버에 내용이 있으면 "서버에서 받아오기"를 추천한다.
 */
function SyncChoiceDialog({ kind, onClose }: { kind: SyncKind; onClose: () => void }) {
  const { inspect, keepLocal, takeServer } = useSync();
  const [info, setInfo] = useState<ChoiceInfo | null>(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const label = KINDS[kind].label;

  const load = useCallback(async () => {
    setInfo(null);
    setInfo(await inspect(kind));
  }, [inspect, kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const choose = async (run: (k: SyncKind) => Promise<string | null>) => {
    setWorking(true);
    setMessage(null);
    const failure = await run(kind);
    setWorking(false);
    if (failure === null) {
      onClose();
      return;
    }
    setMessage(failure);
    // 그 사이 서버가 바뀌었을 수 있으니 양쪽 정보를 다시 읽는다
    void load();
  };

  const pullFirst = info !== null && info.localEmpty && info.server !== null;
  const ready = info !== null && !working;

  const keepButton = (
    <button
      type="button"
      className={`setup-btn ${pullFirst ? "setup-btn--ghost" : "setup-btn--primary"}`}
      disabled={!ready}
      onClick={() => void choose(keepLocal)}
    >
      {pullFirst ? "PC 내용 남기기" : "PC 내용 남기기 (추천)"}
    </button>
  );
  const takeButton = (
    <button
      type="button"
      className={`setup-btn ${pullFirst ? "setup-btn--primary" : "setup-btn--ghost"}`}
      disabled={!ready || info?.server === null}
      onClick={() => void choose(takeServer)}
    >
      {pullFirst ? "서버에서 받아오기 (추천)" : "서버 내용 받기"}
    </button>
  );

  return (
    <SettingsDialog
      title={`${label} 내용 고르기`}
      icon={<RefreshIcon />}
      onClose={working ? null : onClose}
      footer={
        pullFirst ? (
          <>
            {keepButton}
            {takeButton}
          </>
        ) : (
          <>
            {takeButton}
            {keepButton}
          </>
        )
      }
    >
      <p>
        {pullFirst
          ? `이 PC의 ${label} 내용이 비어 있고 서버에는 내용이 있습니다. 서버 내용을 받아 올까요?`
          : `이 PC와 서버의 ${label} 내용이 다릅니다. 어느 쪽을 남길지 골라 주세요.`}
      </p>
      {info === null ? (
        <p>양쪽 내용을 확인하는 중…</p>
      ) : (
        <div className="settings-rows sync-choice__rows">
          <div className="settings-row">
            <span className="settings-row__k">이 PC</span>
            <span className="settings-row__v">마지막 수정 {sideText(info.localTime, info.localDevice)}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row__k">서버</span>
            <span className="settings-row__v">
              {info.server
                ? `마지막 수정 ${sideText(info.server.time, info.server.device)}`
                : info.error
                  ? `읽지 못함 (${info.error})`
                  : "내용 없음"}
            </span>
          </div>
        </div>
      )}
      <div className="set-dialog__keep">
        <SmallCheckIcon size={16} />
        덮이는 쪽은 백업 폴더에 남습니다
      </div>
      {working && <p>처리하는 중…</p>}
      {message && (
        <p className="sync-choice__error" role="alert">
          {message}
        </p>
      )}
    </SettingsDialog>
  );
}

export default SyncChoiceDialog;
