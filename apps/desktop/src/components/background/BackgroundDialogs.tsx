import { useBackground } from "../../features/background/BackgroundProvider";
import ConfirmDialog from "../common/ConfirmDialog";
import NoticeDialog from "../common/NoticeDialog";

const CLOSE_NOTICE =
  "창을 닫아도 Daybrick은 트레이에서 계속 실행돼요. 완전히 끄려면 트레이 아이콘에서 '종료'를 누르세요.";

/**
 * 첫 닫기 안내(백그라운드 실행 R4)와 타이머 종료 확인(R10).
 * 제목 표시줄에 두어 사이드바가 있는 화면·없는 화면 모두에서 보이게 한다. BackgroundProvider 밖이면 그리지 않는다.
 */
function BackgroundDialogs() {
  const background = useBackground();
  if (!background) return null;

  if (background.dialog === "close-notice") {
    return (
      <NoticeDialog
        title="창 닫기"
        message={CLOSE_NOTICE}
        buttonLabel="확인"
        onConfirm={background.confirmCloseNotice}
        onDismiss={background.dismissCloseNotice}
      />
    );
  }
  if (background.dialog === "quit-confirm") {
    return (
      <ConfirmDialog
        title="앱 종료"
        message="타이머가 실행 중이에요. 종료할까요?"
        confirmLabel="종료"
        confirmTone="danger"
        onConfirm={background.confirmQuit}
        onCancel={background.cancelQuit}
      />
    );
  }
  return null;
}

export default BackgroundDialogs;
