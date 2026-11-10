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

/** 받기·설치 실패 알림 제목. 설정 줄의 실패 문구와 같다 (R22, R23) */
const FAILURE_TITLES = {
  network: "업데이트를 받지 못했어요. 다시 시도해 주세요.",
  signature: "업데이트 파일을 확인하지 못해 설치하지 않았어요.",
} as const;

/** 실패 알림 (R22–R24, D3). 합치기 키 하나로 반복돼도 안 읽은 알림 하나로 합친다 */
export function failureNotice(kind: keyof typeof FAILURE_TITLES): NotifyInput {
  return {
    source: UPDATER_SOURCE,
    kind: "update-failed",
    importance: "warning",
    title: FAILURE_TITLES[kind],
    body: "설정에서 다시 설치할 수 있어요",
    target: { ...SETTINGS_APP },
    mergeKey: "update-failed",
  };
}
