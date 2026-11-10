import type { NotifyInput } from "../notifications/types";

/** 업데이트 알림을 보내는 기능 이름 (D3, 알림에 "Daybrick"으로 보임) */
export const UPDATER_SOURCE = "updater";

/** 업데이트 알림이 가는 곳: 설정 "앱" 칸 (R8, D3) */
const SETTINGS_APP = { page: "settings", tab: "app" };

/** 새 버전 알림 (R6, R7). 합치기 키로 안 읽은 이전 버전 알림을 갱신한다 */
export function newVersionNotice(version: string): NotifyInput {
  return {
    source: UPDATER_SOURCE,
    kind: "update-available",
    importance: "info",
    title: `새 버전 ${version}이 나왔어요`,
    body: "설정에서 설치할 수 있어요",
    target: { ...SETTINGS_APP },
    mergeKey: "update-available",
  };
}
