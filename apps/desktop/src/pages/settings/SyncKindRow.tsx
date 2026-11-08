import type { KindState, KindSync } from "../../features/sync/types";

/** 상태 글자와 색 (R29). 색은 서버 연결 칸의 settings-state와 같다 */
const STATE_VIEW: Record<KindState, { label: string; tone: "ok" | "warn" | "bad" | "none" }> = {
  ok: { label: "맞음", tone: "ok" },
  pending: { label: "대기", tone: "warn" },
  choice: { label: "선택 필요", tone: "warn" },
  error: { label: "오류", tone: "bad" },
  skipped: { label: "건너뜀", tone: "none" },
};

/** "11/8 19:08" (PC 현지 시각) */
function formatTime(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

/** 상태 옆 보조 문구: 올린 시각·오류 문구·건너뛴 이유 */
function subText(sync: KindSync): string {
  switch (sync.state) {
    case "ok": {
      const time = sync.syncedAt ? formatTime(sync.syncedAt) : null;
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

/** 종류 한 줄: 이름 · 상태 글자 · 보조 문구 */
function SyncKindRow({ label, sync }: { label: string; sync: KindSync }) {
  const view = STATE_VIEW[sync.state];
  return (
    <div className="settings-row">
      <span className="settings-row__k">{label}</span>
      <span className="settings-row__v sync-kind__v">
        <span className={`settings-state settings-state--${view.tone}`}>{view.label}</span>
        <span className="sync-kind__sub" title={sync.state === "skipped" ? (sync.error ?? undefined) : undefined}>
          {subText(sync)}
        </span>
      </span>
    </div>
  );
}

export default SyncKindRow;
