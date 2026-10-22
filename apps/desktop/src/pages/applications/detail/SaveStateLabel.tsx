import { CheckIcon } from "../../../components/icons/DialogIcons";
import type { SaveStatus } from "../../../features/applications/useAutoSave";

/** 팝업 오른쪽 위 자동 저장 표시: "저장 중… / 저장됨 / 저장 실패" (R15) */
function SaveStateLabel({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return <span className="detail-modal__save">저장 중…</span>;
  }
  if (status === "error") {
    return (
      <span className="detail-modal__save detail-modal__save--error" title="파일에 쓰지 못했어요. 다시 고치면 다시 시도해요.">
        저장 실패
      </span>
    );
  }
  // idle(아직 고친 것 없음)도 파일과 내용이 같으므로 "저장됨"
  return (
    <span className="detail-modal__save">
      <CheckIcon />
      저장됨
    </span>
  );
}

export default SaveStateLabel;
