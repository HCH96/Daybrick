import { useCallback, useEffect, useRef, useState } from "react";
import { applyMigrations, deployFunctions, getAppSchemaVersion } from "./management";
import { probeServer } from "./probe";
import { RERUN_STEPS } from "./rerunSetup";
import { fetchHealth } from "./serverFunctions";
import type { ServerSession } from "./session";
import {
  RUN_STEPS,
  initialRunProgress,
  runSteps,
  type RunOutcome,
  type RunProgress,
  type RunStepDef,
  type StepResult,
} from "./setupRunner";

/**
 * 서버 업데이트 (R23, R25, R26).
 * 서버의 지금 번호 다음부터 앱의 최신 번호까지 SQL 단계를 적용하고(D28), 서버 함수 묶음을 다시 배포한다(D16).
 * 진행 표시·실패·다시 시도는 자동 세팅과 같은 고리(`runSteps`)를 쓴다.
 */

/** 서버 업데이트 단계. id는 자동 세팅과 같은 것을 써서 실패 문구를 함께 쓴다. */
export const UPDATE_STEPS: readonly RunStepDef[] = [
  { id: "schema", name: "서버 구조 적용", desc: "빠진 번호의 테이블·접근 규칙" },
  { id: "functions", name: "서버 함수 배포", desc: "앱이 가진 서버 함수 묶음" },
  { id: "verify", name: "마무리 확인", desc: "접속·서버 구조 번호 확인" },
];

/** 실행 단계 목록의 종류: 자동 세팅(③), 서버 업데이트, 자동 세팅 다시 실행(설정) */
export type RunFlow = "setup" | "update" | "rerun";

export function stepsForFlow(flow: RunFlow): readonly RunStepDef[] {
  if (flow === "update") return UPDATE_STEPS;
  return flow === "rerun" ? RERUN_STEPS : RUN_STEPS;
}

/** 업데이트에 넘기는 것. PAT는 메모리에만 두고, 끝나면 화면이 버린다. */
export interface UpdateContext {
  pat: string;
  projectRef: string;
  appSchema: number;
  /** 마무리 확인(health)에 쓰는 로그인 세션 */
  session: ServerSession | null;
}

async function verifyUpdate(ctx: UpdateContext): Promise<StepResult> {
  if (!ctx.session) return { ok: false, error: "unauthorized" };
  const health = await fetchHealth(ctx.session.client);
  if (!health.ok) return health;
  if (health.value.schema !== ctx.appSchema) return { ok: false, error: "schema-mismatch" };
  return { ok: true, value: `서버 구조 ${ctx.appSchema} 확인` };
}

async function runUpdateStep(index: number, ctx: UpdateContext): Promise<StepResult> {
  switch (UPDATE_STEPS[index].id) {
    case "schema": {
      const result = await applyMigrations(ctx.pat, ctx.projectRef);
      if (!result.ok) return result;
      const { from, to } = result.value;
      return { ok: true, value: from === to ? `이미 ${to}번 (적용할 단계 없음)` : `서버 구조 ${from} → ${to}` };
    }
    case "functions": {
      const result = await deployFunctions(ctx.pat, ctx.projectRef);
      return result.ok ? { ok: true, value: null } : result;
    }
    default:
      return verifyUpdate(ctx);
  }
}

/** 서버 구조 번호 한 쌍: 서버(구조가 없으면 null, 읽지 못하면 undefined)와 앱 */
export interface SchemaPair {
  server: number | null | undefined;
  app: number;
}

/** 서버 번호는 공개 RPC로 읽는다 (로그인 없이도 됨, D17) */
export async function loadSchemaPair(url: string, anonKey: string): Promise<SchemaPair> {
  const [probe, app] = await Promise.all([probeServer(url, anonKey), getAppSchemaVersion()]);
  return { server: probe.kind === "ok" ? probe.schema : undefined, app };
}

/** 화면에서 서버·앱 번호를 한 번 읽어 둔다. 읽기 전에는 null. */
export function useSchemaPair(url: string | null, anonKey: string | null): SchemaPair | null {
  const [pair, setPair] = useState<SchemaPair | null>(null);
  useEffect(() => {
    if (!url || !anonKey) return;
    let cancelled = false;
    void loadSchemaPair(url, anonKey).then((loaded) => {
      if (!cancelled) setPair(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [url, anonKey]);
  return pair;
}

export interface ServerUpdateRun {
  progress: RunProgress;
  running: boolean;
  /** 마지막 실행이 끝난 까닭 (시작 전·실행 중이면 null) */
  outcome: RunOutcome | null;
  /** [업데이트]: 처음 단계부터 */
  start: (ctx: UpdateContext) => void;
  /** [다시 시도]: 실패한 단계부터 (R17과 같음) */
  retry: () => void;
}

/** 업데이트 실행 상태. 화면이 닫히면 늦게 온 결과는 버린다. */
export function useServerUpdateRun(): ServerUpdateRun {
  const [progress, setProgress] = useState<RunProgress>(() => initialRunProgress(UPDATE_STEPS));
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const seqRef = useRef(0);
  const ctxRef = useRef<UpdateContext | null>(null);

  useEffect(
    () => () => {
      seqRef.current += 1;
      ctxRef.current = null;
    },
    [],
  );

  const begin = useCallback(async (ctx: UpdateContext, from: RunProgress, startIndex: number) => {
    const seq = ++seqRef.current;
    setRunning(true);
    setOutcome(null);
    const result = await runSteps(
      UPDATE_STEPS.length,
      (index) => runUpdateStep(index, ctx),
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
    // 끝나면 PAT를 버린다 (실패면 다시 시도에 쓰도록 남긴다)
    if (result === "done") ctxRef.current = null;
  }, []);

  const start = useCallback(
    (ctx: UpdateContext) => {
      ctxRef.current = ctx;
      const fresh = initialRunProgress(UPDATE_STEPS);
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
