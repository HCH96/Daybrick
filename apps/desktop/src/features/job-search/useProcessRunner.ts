import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ServerSession } from "../server/session";
import { runProcessNow, type RunResult, type RunState } from "./processRun";

/** [지금 평가] 실행기. 구직 관리 화면(JobSearchProvider)에 하나 두어 탭을 옮겨도 이어 돈다 */
export interface ProcessRunner {
  state: RunState;
  /** 마지막 실행 결과 줄 */
  result: RunResult;
  /** 공고 단계가 바뀔 때마다 1씩 는다. 목록·상태를 다시 읽는 데 쓴다 */
  version: number;
  start: () => void;
  stop: () => void;
}

export function useProcessRunner(session: ServerSession, onFinish: () => void): ProcessRunner {
  const [state, setState] = useState<RunState>({ kind: "idle" });
  const [result, setResult] = useState<RunResult>(null);
  const [version, setVersion] = useState(0);
  const cancelRef = useRef(false);
  const runningRef = useRef(false);

  // 화면을 떠나면(구직 관리 밖으로) 실행을 멈춘다
  useEffect(
    () => () => {
      cancelRef.current = true;
    },
    [],
  );

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    cancelRef.current = false;
    setResult(null);
    setState({ kind: "submitting" });
    void runProcessNow({
      session,
      onState: setState,
      onProgress: () => setVersion((v) => v + 1),
      cancelled: () => cancelRef.current,
    }).then((line) => {
      runningRef.current = false;
      setState({ kind: "idle" });
      setResult(line);
      setVersion((v) => v + 1);
      onFinish();
    });
  }, [session, onFinish]);

  const stop = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return useMemo(() => ({ state, result, version, start, stop }), [state, result, version, start, stop]);
}
