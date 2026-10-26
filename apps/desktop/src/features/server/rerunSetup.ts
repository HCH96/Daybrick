import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyMigrations,
  configureAuth,
  deployFunctions,
  disableSignup,
  setSecrets,
  type ApiResult,
} from "./management";
import type { ServerSession } from "./session";
import {
  RUN_STEPS,
  VERIFIED_DETAIL,
  initialRunProgress,
  runSteps,
  verifyServer,
  type RunOutcome,
  type RunProgress,
  type RunStepDef,
  type StepResult,
} from "./setupRunner";

/**
 * 자동 세팅 다시 실행 (R49): ③의 1~4단계와 6단계(계정 등록 제외).
 * 복구용이라 데이터·로그인 계정은 건드리지 않고, 새 가입 막기는 켠 상태로 둔다 (D12).
 * Anthropic 키는 다시 받지 않으므로 비밀값 단계는 Google 값을 바꿀 때만 등록한다.
 */

/** 다시 실행 단계: 자동 세팅과 같은 정의에서 계정 등록만 뺀다 */
export const RERUN_STEPS: readonly RunStepDef[] = RUN_STEPS.filter((step) => step.id !== "account").map(
  (step) => (step.id === "secrets" ? { ...step, desc: "Google 클라이언트 값 (바꿀 때만)" } : step),
);

/** 다시 실행에 넘기는 것. PAT·Google 값은 메모리에만 두고, 끝나면 버린다. */
export interface RerunContext {
  pat: string;
  projectRef: string;
  /** 비워 두면 서버의 지금 값 유지 */
  googleClientId: string;
  googleClientSecret: string;
  appSchema: number;
  /** 마무리 확인에 쓰는 로그인 세션 */
  session: ServerSession;
}

/** 관리 API 결과를 단계 결과로 (성공하면 작은 글씨 value) */
function done(result: ApiResult<null>, value: string | null = null): StepResult {
  return result.ok ? { ok: true, value } : result;
}

async function runRerunStep(index: number, ctx: RerunContext): Promise<StepResult> {
  const { pat, projectRef, googleClientId, googleClientSecret } = ctx;
  const changeGoogle = googleClientId.trim() !== "" && googleClientSecret.trim() !== "";
  switch (RERUN_STEPS[index].id) {
    case "auth": {
      const auth = await configureAuth(pat, projectRef, googleClientId, googleClientSecret);
      if (!auth.ok) return auth;
      // 새 가입 막기는 다시 켜 둔다 (이미 켜져 있으면 그대로)
      return done(await disableSignup(pat, projectRef), changeGoogle ? "Google 클라이언트 값 바꿈" : null);
    }
    case "schema": {
      const result = await applyMigrations(pat, projectRef);
      if (!result.ok) return result;
      const { from, to } = result.value;
      return { ok: true, value: from === to ? `이미 ${to}번 (적용할 단계 없음)` : `서버 구조 ${from} → ${to}` };
    }
    case "functions":
      return done(await deployFunctions(pat, projectRef));
    case "secrets": {
      if (!changeGoogle) return { ok: true, value: "바꿀 값 없음 (그대로 둠)" };
      return done(await setSecrets(pat, projectRef, "", googleClientId, googleClientSecret));
    }
    default: {
      const verified = await verifyServer(ctx.session, ctx.appSchema);
      return verified.ok ? { ok: true, value: VERIFIED_DETAIL } : verified;
    }
  }
}

export interface RerunSetupRun {
  progress: RunProgress;
  running: boolean;
  /** 마지막 실행이 끝난 까닭 (시작 전·실행 중이면 null) */
  outcome: RunOutcome | null;
  /** [다시 실행]: 처음 단계부터 */
  start: (ctx: RerunContext) => void;
  /** [다시 시도]: 실패한 단계부터 (R17과 같음) */
  retry: () => void;
}

/** 다시 실행 상태. 창이 닫히면 늦게 온 결과는 버리고 PAT도 버린다. */
export function useRerunSetup(): RerunSetupRun {
  const [progress, setProgress] = useState<RunProgress>(() => initialRunProgress(RERUN_STEPS));
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const seqRef = useRef(0);
  const ctxRef = useRef<RerunContext | null>(null);

  useEffect(
    () => () => {
      seqRef.current += 1;
      ctxRef.current = null;
    },
    [],
  );

  const begin = useCallback(async (ctx: RerunContext, from: RunProgress, startIndex: number) => {
    const seq = ++seqRef.current;
    setRunning(true);
    setOutcome(null);
    const result = await runSteps(
      RERUN_STEPS.length,
      (index) => runRerunStep(index, ctx),
      from,
      startIndex,
      (next) => {
        if (seq === seqRef.current) setProgress(next);
      },
      () => seq !== seqRef.current,
    );
    if (seq !== seqRef.current) return;
    setRunning(false);
    setOutcome(result);
    if (result === "done") ctxRef.current = null;
  }, []);

  const start = useCallback(
    (ctx: RerunContext) => {
      ctxRef.current = ctx;
      const fresh = initialRunProgress(RERUN_STEPS);
      setProgress(fresh);
      void begin(ctx, fresh, 0);
    },
    [begin],
  );

  const retry = useCallback(() => {
    const ctx = ctxRef.current;
    if (running || !ctx || !progress.failure) return;
    void begin(ctx, progress, progress.failure.index);
  }, [running, progress, begin]);

  return { progress, running, outcome, start, retry };
}
