/**
 * 파일 끌어 놓기 막이 (job-search 4단계).
 * 창 설정 `dragDropEnabled: false`로 웹 화면이 파일 끌어 놓기를 직접 받게 했으므로,
 * 받는 곳(프로필 자료 칸 등)이 아닌 데에 파일을 놓으면 웹 화면이 그 파일로 이동해 앱이 사라진다.
 * 받는 곳이 처리하지 않은 파일 끌기는 창 전체에서 기본 동작을 막는다. 글 끌기는 건드리지 않는다.
 */
function hasFiles(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes("Files") ?? false;
}

export function installFileDropGuard(): void {
  // 받는 곳이 먼저 preventDefault 했으면(받겠다는 뜻) 그대로 두고, 아니면 "놓을 수 없음" 표시
  window.addEventListener("dragover", (event) => {
    if (event.defaultPrevented || !hasFiles(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
  });
  window.addEventListener("drop", (event) => {
    if (hasFiles(event)) event.preventDefault();
  });
}
