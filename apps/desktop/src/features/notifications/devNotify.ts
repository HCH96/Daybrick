import { notify } from "./notify";

declare global {
  interface Window {
    /** 개발 모드 전용: 콘솔에서 테스트 알림을 보낸다 */
    daybrickNotify?: typeof notify;
  }
}

/** 개발 모드에서만 `window.daybrickNotify`를 연다. 배포 빌드에서는 아무것도 하지 않는다. */
export function installDevNotify(): void {
  if (import.meta.env.DEV) {
    window.daybrickNotify = notify;
  }
}
