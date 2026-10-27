/** 판 아래 저장 결과 한 줄: 성공 초록, 실패 빨강. null이면 숨긴다 */
export type SaveState = { ok: boolean; text: string } | null;

function SaveResult({ state }: { state: SaveState }) {
  if (!state) return null;
  return (
    <span className={`js-settings__result js-settings__result--${state.ok ? "ok" : "bad"}`} role="status">
      {state.text}
    </span>
  );
}

export default SaveResult;
