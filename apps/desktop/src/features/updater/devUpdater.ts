import type { UpdaterPhase } from "./UpdaterProvider";

type PhaseKind = UpdaterPhase["kind"];

/** 흉내 상태를 만들 때 바꿀 수 있는 값 */
interface DevUpdaterOptions {
  version?: string;
  /** null이면 변경 내용 없음 */
  notes?: string | null;
  /** downloading일 때만. null이면 퍼센트를 모름 */
  percent?: number | null;
}

type DevUpdater = (kind: PhaseKind, options?: DevUpdaterOptions) => void;

declare global {
  interface Window {
    /** 개발 모드 전용: 콘솔에서 업데이트 상태를 바꿔 본다 (예: `daybrickUpdater("downloading", { percent: 42 })`) */
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

/**
 * 개발 모드에서만 `window.daybrickUpdater`를 연다 (자동 업데이트 4단계 확인용). 배포 빌드에서는 아무것도 하지 않는다.
 * 돌려준 함수를 부르면 닫는다.
 */
export function installDevUpdater(setPhase: (phase: UpdaterPhase) => void): () => void {
  if (!import.meta.env.DEV) return () => {};
  const apply: DevUpdater = (kind, options = {}) => {
    const next = samplePhase(kind, options);
    if (!next) {
      console.warn("모르는 업데이트 상태", kind);
      return;
    }
    setPhase(next);
  };
  window.daybrickUpdater = apply;
  return () => {
    if (window.daybrickUpdater === apply) delete window.daybrickUpdater;
  };
}
