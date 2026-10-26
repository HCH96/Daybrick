import { useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { DISCONNECT_CONFIRM, SERVER_DATA_KEPT, switchConfirm } from "../../features/server/messages";
import { useServer } from "../../features/server/useServer";
import { parseSupabaseUrl } from "../../features/server/validate";

interface ServerDangerRowProps {
  /** 왼쪽 안내 글 */
  hint: string;
  /** [다른 Supabase로 바꾸기]도 보일지 (로그인 필요 칸은 해제만) */
  withSwitch: boolean;
}

/**
 * 서버 연결 칸 맨 아래 줄: [다른 Supabase로 바꾸기]·[서버 연결 해제] (R49, R50).
 * 둘 다 확인 팝업([취소] 기본)을 거치고, 이 PC의 연결 정보·로그인 정보만 지운다. 바꾸기는 지운 뒤 마법사를 연다.
 */
function ServerDangerRow({ hint, withSwitch }: ServerDangerRowProps) {
  const { config, clearConnection, openSetup } = useServer();
  const [asking, setAsking] = useState<"disconnect" | "switch" | null>(null);
  const url = config?.connection?.url ?? null;
  const ref = url ? (parseSupabaseUrl(url)?.ref ?? null) : null;

  const confirm = async () => {
    const switching = asking === "switch";
    setAsking(null);
    try {
      await clearConnection();
    } catch (e: unknown) {
      console.error("서버 연결 정보를 지우지 못함", e);
      return;
    }
    if (switching) openSetup();
  };

  const texts = asking === "switch" ? switchConfirm(ref) : DISCONNECT_CONFIRM;

  return (
    <div className="settings-danger">
      <span className="settings-danger__hint">{hint}</span>
      {withSwitch && (
        <button type="button" className="settings-btn settings-btn--sm" onClick={() => setAsking("switch")}>
          다른 Supabase로 바꾸기
        </button>
      )}
      <button
        type="button"
        className="settings-btn settings-btn--sm settings-btn--danger"
        onClick={() => setAsking("disconnect")}
      >
        서버 연결 해제
      </button>
      {asking && (
        <ConfirmDialog
          title={texts.title}
          message={texts.message}
          confirmLabel={texts.confirmLabel}
          note={SERVER_DATA_KEPT}
          confirmTone={asking === "switch" ? "primary" : "danger"}
          onConfirm={() => void confirm()}
          onCancel={() => setAsking(null)}
        />
      )}
    </div>
  );
}

export default ServerDangerRow;
