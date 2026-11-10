import { useUpdater } from "../../features/updater/UpdaterProvider";
import ConfirmDialog from "../common/ConfirmDialog";

/**
 * 업데이트 설치 전 타이머 확인 창 (자동 업데이트 R17, R20).
 * 제목 표시줄에 두어 어느 페이지에 있든(받는 도중 다른 페이지로 갔어도) 그 위에 뜨게 한다.
 * Esc·바깥 클릭은 [나중에 설치]와 같다. UpdaterProvider 밖이면 그리지 않는다.
 */
function UpdateDialogs() {
  const updater = useUpdater();
  if (!updater || updater.dialog !== "timer-confirm") return null;
  return (
    <ConfirmDialog
      title="업데이트 설치"
      message="타이머가 실행 중이에요. 기록을 저장하고 설치할까요?"
      confirmLabel="기록 저장하고 설치"
      confirmTone="primary"
      cancelLabel="나중에 설치"
      onConfirm={updater.confirmTimer}
      onCancel={updater.postponeInstall}
    />
  );
}

export default UpdateDialogs;
