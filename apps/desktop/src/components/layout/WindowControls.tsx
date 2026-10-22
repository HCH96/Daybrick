import { useEffect, useMemo, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { CloseIcon, MaximizeIcon, MinimizeIcon, RestoreIcon } from "../icons/TitleBarIcons";

/**
 * 오른쪽 창 버튼: 최소화, 최대화/이전 크기로, 닫기.
 * Tauri 창이 아닐 때(브라우저로 미리 볼 때)는 모양만 보이고 눌러도 아무 일도 없다.
 */
function WindowControls() {
  const appWindow = useMemo(() => (isTauri() ? getCurrentWindow() : null), []);
  const [maximized, setMaximized] = useState(false);

  // 창 크기가 바뀔 때마다 최대화 상태를 다시 읽어 아이콘을 바꾼다.
  useEffect(() => {
    if (!appWindow) return;
    let alive = true;
    let unlisten: (() => void) | undefined;

    const sync = () => {
      void appWindow.isMaximized().then((value) => {
        if (alive) setMaximized(value);
      });
    };
    sync();
    void appWindow.onResized(sync).then((stop) => {
      if (alive) unlisten = stop;
      else stop();
    });

    return () => {
      alive = false;
      unlisten?.();
    };
  }, [appWindow]);

  const maximizeLabel = maximized ? "이전 크기로" : "최대화";

  return (
    <div className="window-controls">
      <button
        type="button"
        className="window-controls__button"
        aria-label="최소화"
        title="최소화"
        onClick={() => void appWindow?.minimize()}
      >
        <MinimizeIcon />
      </button>
      <button
        type="button"
        className="window-controls__button"
        aria-label={maximizeLabel}
        title={maximizeLabel}
        onClick={() => void appWindow?.toggleMaximize()}
      >
        {maximized ? <RestoreIcon /> : <MaximizeIcon />}
      </button>
      <button
        type="button"
        className="window-controls__button window-controls__button--close"
        aria-label="닫기"
        title="닫기"
        onClick={() => void appWindow?.close()}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export default WindowControls;
