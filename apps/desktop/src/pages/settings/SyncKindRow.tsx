import { useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Popover from "../../components/common/Popover";
import { DotsIcon } from "../../components/icons/CommonIcons";
import type { KindState, KindSync, SyncKind } from "../../features/sync/types";
import { useSync } from "../../features/sync/useSync";
import SyncChoiceDialog from "./SyncChoiceDialog";
import { formatSyncTime } from "./syncTime";

/** 상태 글자와 색 (R29). 색은 서버 연결 칸의 settings-state와 같다 */
const STATE_VIEW: Record<KindState, { label: string; tone: "ok" | "warn" | "bad" | "none" }> = {
  ok: { label: "맞음", tone: "ok" },
  pending: { label: "대기", tone: "warn" },
  choice: { label: "선택 필요", tone: "warn" },
  error: { label: "오류", tone: "bad" },
  skipped: { label: "건너뜀", tone: "none" },
};

/** 상태 옆 보조 문구: 올린 시각·오류 문구·건너뛴 이유 */
function subText(sync: KindSync): string {
  switch (sync.state) {
    case "ok": {
      const time = sync.syncedAt ? formatSyncTime(sync.syncedAt) : null;
      return time ? `${time} 올림` : "아직 올리지 않음";
    }
    case "pending":
      return sync.error ?? "올릴 차례를 기다리는 중";
    case "choice":
      return "서버와 내용이 달라 고르기가 필요합니다";
    case "error":
      return sync.error ?? "올리지 못했습니다";
    case "skipped":
      return "파일을 읽지 못함";
  }
}

interface SyncKindRowProps {
  kind: SyncKind;
  label: string;
  sync: KindSync;
  /** 고르기·받아오기를 할 수 있는지 (켜짐·로그인·다른 작업 안 함) */
  canAct: boolean;
}

/** 종류 한 줄: 이름 · 상태 글자 · 보조 문구 · [고르기]·⋯ 메뉴 (R19, R31) */
function SyncKindRow({ kind, label, sync, canAct }: SyncKindRowProps) {
  const { takeServer } = useSync();
  const view = STATE_VIEW[sync.state];
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const pull = async () => {
    setConfirming(false);
    setFailure(await takeServer(kind));
  };

  return (
    <div className="settings-row">
      <span className="settings-row__k">{label}</span>
      <span className="settings-row__v sync-kind__v">
        <span className={`settings-state settings-state--${view.tone}`}>{view.label}</span>
        {failure ? (
          <span className="sync-kind__sub sync-kind__sub--bad" role="alert">
            {failure}
          </span>
        ) : (
          <span className="sync-kind__sub" title={sync.state === "skipped" ? (sync.error ?? undefined) : undefined}>
            {subText(sync)}
          </span>
        )}
      </span>
      <span className="sync-kind__actions">
        {sync.state === "choice" && (
          <button
            type="button"
            className="settings-btn settings-btn--sm"
            disabled={!canAct}
            onClick={() => {
              setFailure(null);
              setChoosing(true);
            }}
          >
            고르기
          </button>
        )}
        <button
          type="button"
          className="sync-kind__more"
          aria-label={`${label} 메뉴`}
          aria-expanded={menuAnchor !== null}
          disabled={!canAct}
          onClick={(e) => setMenuAnchor(menuAnchor ? null : e.currentTarget)}
        >
          <DotsIcon size={16} />
        </button>
      </span>

      {menuAnchor && (
        <Popover anchor={menuAnchor} onClose={() => setMenuAnchor(null)} placement="bottom-end" width={176} ariaLabel={`${label} 메뉴`}>
          <button
            type="button"
            className="pop-row"
            autoFocus
            onClick={() => {
              setMenuAnchor(null);
              setFailure(null);
              setConfirming(true);
            }}
          >
            서버에서 받아오기
          </button>
        </Popover>
      )}

      {confirming && (
        <ConfirmDialog
          title={`${label} 서버에서 받아오기`}
          message={`PC의 ${label} 내용을 서버 내용으로 바꿉니다. 지금 내용은 백업됩니다.`}
          confirmLabel="받아오기"
          confirmTone="primary"
          onCancel={() => setConfirming(false)}
          onConfirm={() => void pull()}
        />
      )}

      {choosing && <SyncChoiceDialog kind={kind} onClose={() => setChoosing(false)} />}
    </div>
  );
}

export default SyncKindRow;
