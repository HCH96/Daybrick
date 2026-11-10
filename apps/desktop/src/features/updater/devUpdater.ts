import type { DownloadProgress, UpdateBackend, UpdateError } from "./api";
import type { UpdaterPhase } from "./UpdaterProvider";

type PhaseKind = UpdaterPhase["kind"];

/**
 * 상태 이름 대신 쓸 수 있는 흉내 동작 (자동 업데이트 5단계 확인용).
 * - install: [설치하고 다시 시작]을 누른 것과 같다 (개발 모드에서는 버튼이 비활성이라 여기서 부른다)
 * - done: 받는 중인 흉내를 성공으로 끝낸다 / fail: 받기 실패 / badSignature: 서명 실패
 */
type DevAction = "install" | "done" | "fail" | "badSignature";

/** 흉내 상태를 만들 때 바꿀 수 있는 값 */
interface DevUpdaterOptions {
  version?: string;
  /** null이면 변경 내용 없음 */
  notes?: string | null;
  /** downloading일 때만. null이면 퍼센트를 모름 */
  percent?: number | null;
}

type DevUpdater = (kind: PhaseKind | DevAction, options?: DevUpdaterOptions) => void;

declare global {
  interface Window {
    /**
     * 개발 모드 전용: 콘솔에서 업데이트 상태를 바꿔 본다 (예: `daybrickUpdater("downloading", { percent: 42 })`).
     * 설치 흐름은 `daybrickUpdater("available")` → `("install")` → `("done" | "fail" | "badSignature")`.
     */
    daybrickUpdater?: DevUpdater;
  }
}

const SAMPLE_NOTES = "· 설정에서 새 버전을 확인하고 설치할 수 있어요\n· 알림을 누르면 설정 앱 칸으로 바로 가요";

/** 이름과 값으로 흉내 상태를 만든다. 모르는 이름이면 null */
function samplePhase(kind: PhaseKind, options: DevUpdaterOptions): UpdaterPhase | null {
  const found = {
    version: options.version ?? "0.2.1",
    notes: options.notes === undefined ? SAMPLE_NOTES : options.notes,
  };
  switch (kind) {
    case "idle":
    case "checking":
    case "upToDate":
    case "checkFailed":
      return { kind };
    case "available":
    case "downloadFailed":
    case "signatureFailed":
    case "installing":
      return { kind, ...found };
    case "downloading":
      return { kind, percent: options.percent === undefined ? 42 : options.percent, ...found };
    default:
      return null;
  }
}

/** 흉내 받기를 끝낼 때 부를 함수 (받는 중이 아니면 null) */
interface PendingDownload {
  resolve: () => void;
  reject: (e: UpdateError) => void;
}

/** 개발 모드 흉내에 필요한 Provider 쪽 함수 */
export interface DevUpdaterHooks {
  setPhase: (phase: UpdaterPhase) => void;
  /** Provider의 [설치하고 다시 시작] */
  install: () => void;
  /** 받기·설치 명령을 바꿔 끼운다. null이면 실제 명령으로 되돌린다 */
  setBackend: (backend: UpdateBackend | null) => void;
}

/**
 * 개발 모드에서만 `window.daybrickUpdater`를 열고, 받기·설치 명령을 흉내로 바꿔 끼운다 (자동 업데이트 4·5단계 확인용).
 * 흉내 받기는 콘솔에서 done·fail·badSignature를 부를 때까지 끝나지 않는다. 설치 명령은 부르지 않는다.
 * 배포 빌드에서는 아무것도 하지 않는다. 돌려준 함수를 부르면 닫는다.
 */
export function installDevUpdater(hooks: DevUpdaterHooks): () => void {
  if (!import.meta.env.DEV) return () => {};
  let pending: PendingDownload | null = null;

  const backend: UpdateBackend = {
    download: (onProgress: (p: DownloadProgress) => void) =>
      new Promise<void>((resolve, reject) => {
        onProgress({ downloaded: 42, total: 100 });
        pending = { resolve, reject };
      }),
    install: async () => {
      console.info("개발 모드: 종료 전 저장까지 마쳤어요. 설치 명령은 부르지 않아요");
    },
    discard: async () => {
      console.info("개발 모드: 받은 업데이트를 버렸어요");
    },
  };

  const finish = (error: UpdateError | null) => {
    const current = pending;
    if (!current) {
      console.warn("받는 중인 흉내가 없어요. 먼저 daybrickUpdater(\"install\")를 부르세요");
      return;
    }
    pending = null;
    if (error) current.reject(error);
    else current.resolve();
  };

  const apply: DevUpdater = (kind, options = {}) => {
    switch (kind) {
      case "install":
        hooks.install();
        return;
      case "done":
        finish(null);
        return;
      case "fail":
        finish({ kind: "network", message: "개발 모드 받기 실패 흉내" });
        return;
      case "badSignature":
        finish({ kind: "signature", message: "개발 모드 서명 실패 흉내" });
        return;
    }
    const next = samplePhase(kind, options);
    if (!next) {
      console.warn("모르는 업데이트 상태", kind);
      return;
    }
    hooks.setPhase(next);
  };

  hooks.setBackend(backend);
  window.daybrickUpdater = apply;
  return () => {
    hooks.setBackend(null);
    if (window.daybrickUpdater === apply) delete window.daybrickUpdater;
  };
}
