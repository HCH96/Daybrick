/**
 * 브라우저 미리보기 예시 데이터 넣기. main.tsx가 개발 모드 + Tauri 밖일 때만 불러온다.
 * 주소 `?fixture=<이름>`: 저장된 미리보기 데이터를 지우고 그 예시로 바꾼 뒤, 주소에서 fixture를 뺀다
 * (새로고침해도 다시 넣지 않고, 화면에서 고친 내용이 남는다). `?fixture=empty`는 빈 상태로 시작한다.
 */
import { clearPreview, writePreview, type PreviewKind } from "../previewStore";
import { buildBasic } from "./basic";

const FIXTURES: Record<string, (today: Date) => Partial<Record<PreviewKind, unknown>>> = {
  basic: buildBasic,
  // 빈 데이터. 첫 실행 안내(서버 연결)는 넘긴 상태로 시작한다. 안내를 보려면 localStorage를 비우고 연다.
  empty: () => ({ server: { version: 1, connection: null, welcomeDismissed: true, lastCheck: null } }),
};

export function applyFixtureFromUrl(): void {
  const url = new URL(window.location.href);
  const name = url.searchParams.get("fixture");
  if (name === null) return;
  const build = FIXTURES[name];
  if (!build) {
    console.warn(`[미리보기] 모르는 예시 데이터: ${name} (있는 것: ${Object.keys(FIXTURES).join(", ")})`);
    return;
  }
  clearPreview();
  for (const [kind, data] of Object.entries(build(new Date()))) {
    writePreview(kind as PreviewKind, JSON.stringify(data));
  }
  url.searchParams.delete("fixture");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  console.info(`[미리보기] 예시 데이터 "${name}"를 넣었다.`);
}
