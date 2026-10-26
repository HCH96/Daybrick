import { useCallback, useEffect, useRef, useState } from "react";
import { runSetupPrecheck, type SetupPrecheck } from "../../../features/server/management";
import { checkKeys, type KeysCheck, type KeysRoute } from "../../../features/server/probe";
import { fetchHealth, type HealthInfo } from "../../../features/server/serverFunctions";
import type { ServerSession } from "../../../features/server/session";
import {
  initialRunProgress,
  runSetup,
  type RunContext,
  type RunOutcome,
  type RunProgress,
  type SetupSecrets,
} from "../../../features/server/setupRunner";
import { useWizardLogin, type WizardLogin } from "./useWizardLogin";

/**
 * 마법사 단계. 진행 표시는 ①~④ 네 칸이고, 셋째 칸은 ② 확인 결과(갈래)에 따라 바뀐다 (R6).
 * login-update 갈래는 로그인 칸 안에서 로그인 뒤 서버 업데이트 화면을 보여준다 (updateSession).
 */
export type WizardStepId = "prepare" | "keys" | "setup" | "login" | "app-update" | "done";

export interface WizardStepInfo {
  id: WizardStepId;
  label: string;
}

const PREPARE: WizardStepInfo = { id: "prepare", label: "준비" };
const KEYS: WizardStepInfo = { id: "keys", label: "주소·키" };
const DONE: WizardStepInfo = { id: "done", label: "완료" };
/** 갈래마다 넷째 칸이 완료 */
const DONE_INDEX = 3;

/** 갈래마다 네 칸. 서버 업데이트(login-update)는 로그인 칸 안에서 로그인 뒤에 보여준다 (D23). */
const ROUTE_STEPS: Record<KeysRoute, readonly WizardStepInfo[]> = {
  setup: [PREPARE, KEYS, { id: "setup", label: "자동 세팅" }, DONE],
  login: [PREPARE, KEYS, { id: "login", label: "로그인" }, DONE],
  "login-update": [PREPARE, KEYS, { id: "login", label: "로그인" }, DONE],
  "app-update": [PREPARE, KEYS, { id: "app-update", label: "앱 업데이트" }, DONE],
};

/** ③ 자동 세팅 단계 안의 화면: 입력 → (사전 확인 통과) 실행 (D26) */
export type SetupPhase = "input" | "run";

/** ③에서 받는 값 (비밀값 포함). 하나라도 비면 [세팅 시작]이 꺼진다. */
const SETUP_FIELDS = ["pat", "anthropicKey", "googleClientId", "googleClientSecret"] as const;

/** 마법사에서 입력하는 값. 메모리에만 두고, 취소하면 모두 버린다 (R3, R18). */
export interface WizardInputs {
  url: string;
  anonKey: string;
  pat: string;
  anthropicKey: string;
  googleClientId: string;
  googleClientSecret: string;
}

/** ④ 완료 화면 요약 (R19) */
export interface DoneSummary {
  url: string;
  email: string | null;
  /** 서버 구조 번호 */
  schema: number | null;
  appSchema: number;
  /** 서버에 기록된 Anthropic 키 등록일 (ISO). 읽지 못했으면 null. */
  keyRegisteredAt: string | null;
  /** 자동 세팅으로 끝났는지 (PAT 지우기 안내는 이때만) */
  viaSetup: boolean;
}

const EMPTY_INPUTS: WizardInputs = {
  url: "",
  anonKey: "",
  pat: "",
  anthropicKey: "",
  googleClientId: "",
  googleClientSecret: "",
};

export interface Wizard {
  step: WizardStepId;
  stepIndex: number;
  /** 진행 표시에 그릴 네 칸 (갈래에 따라 셋째 칸 이름이 바뀜) */
  steps: readonly WizardStepInfo[];
  /** 접속에 성공했을 때 정해진 갈래 */
  route: KeysRoute;
  inputs: WizardInputs;
  setInputs: (patch: Partial<WizardInputs>) => void;
  /** ② [확인] 결과. 주소·키를 고치면 지워진다. */
  keysCheck: KeysCheck | null;
  checkingKeys: boolean;
  runKeysCheck: () => Promise<void>;
  /** ③ 입력 화면인지 실행 화면인지 */
  setupPhase: SetupPhase;
  /** ③ 네 칸이 다 찼는지 */
  setupFilled: boolean;
  /** ③ [세팅 시작] 사전 확인 결과. ③ 값을 고치면 지워진다. */
  setupPrecheck: SetupPrecheck | null;
  checkingSetup: boolean;
  /** [세팅 시작]: 키 → PAT → 빈 프로젝트 확인, 통과하면 실행 화면으로 (R12–R14) */
  startSetup: () => Promise<void>;
  /** "빈 프로젝트가 아닙니다" 팝업에서 [그래도 계속] */
  confirmNotEmpty: () => void;
  /** "빈 프로젝트가 아닙니다" 팝업에서 [취소]: 입력 화면에 남는다 */
  dismissNotEmpty: () => void;
  /** ③ 실행 단계별 상태와 실패 */
  runProgress: RunProgress;
  /** 실행 중이면 [이전]·[취소]를 막는다 */
  running: boolean;
  /** 마지막 실행이 끝난 까닭 (실행 중이거나 시작 전이면 null) */
  runOutcome: RunOutcome | null;
  /** [다시 시도]: 실패한 단계부터 이어서 (R17) */
  retryRun: () => void;
  /** Google 로그인 (③ 계정 등록과 로그인 화면이 함께 씀) */
  login: WizardLogin;
  /** 로그인 화면의 [Google로 로그인]: 성공하면 ④ 완료로 (서버 번호가 낮으면 서버 업데이트 화면으로) */
  startLogin: () => Promise<void>;
  /** login-update 갈래에서 로그인한 뒤: 서버 업데이트 화면에 넘길 세션 (그 전에는 null) */
  updateSession: ServerSession | null;
  /** 서버 업데이트 실행 중인지 알린다 ([취소]·[이전]을 막음) */
  setUpdateRunning: (running: boolean) => void;
  /** 서버 업데이트를 마쳤거나 [나중에]: ④ 완료로 */
  finishUpdate: () => void;
  /** ④ 완료 요약 (완료 단계에서만 값이 있음) */
  done: DoneSummary | null;
  /** ④ [시작하기]: 마법사를 닫는다 */
  finish: () => void;
  canCancel: boolean;
  canGoPrev: boolean;
  /** 지금 단계에서 다음으로 갈 수 있는지 (② 단계는 확인 성공 뒤에만) */
  canGoNext: boolean;
  next: () => void;
  prev: () => void;
  cancel: () => void;
}

/**
 * 마법사의 지금 단계와 입력값을 들고 있는다.
 * 마법사 화면이 닫히면(onClose) 이 상태도 함께 사라지므로 입력값이 남지 않는다.
 */
export function useWizard(onClose: () => void): Wizard {
  const [stepIndex, setStepIndex] = useState(0);
  const [inputs, setInputsState] = useState<WizardInputs>(EMPTY_INPUTS);
  const [keysCheck, setKeysCheck] = useState<KeysCheck | null>(null);
  const [checkingKeys, setCheckingKeys] = useState(false);
  // 확인 중에 값을 고치면 늦게 온 결과를 버리기 위한 번호
  const checkSeq = useRef(0);
  const [setupPhase, setSetupPhase] = useState<SetupPhase>("input");
  const [setupPrecheck, setSetupPrecheck] = useState<SetupPrecheck | null>(null);
  const [checkingSetup, setCheckingSetup] = useState(false);
  // ③ 사전 확인 중에 값을 고치거나 취소하면 늦게 온 결과를 버리기 위한 번호
  const setupSeq = useRef(0);
  const [runProgress, setRunProgress] = useState<RunProgress>(initialRunProgress);
  const [running, setRunning] = useState(false);
  const [runOutcome, setRunOutcome] = useState<RunOutcome | null>(null);
  // 실행 중에 마법사가 닫히거나 입력 화면으로 돌아가면 늦게 온 결과를 버리기 위한 번호
  const runSeq = useRef(0);
  const [done, setDone] = useState<DoneSummary | null>(null);
  // 마무리 확인에서 받은 health 결과 (④ 요약에 씀)
  const verifiedRef = useRef<HealthInfo | null>(null);
  const login = useWizardLogin(keysCheck);
  const [updateSession, setUpdateSession] = useState<ServerSession | null>(null);
  const [updateRunning, setUpdateRunning] = useState(false);

  useEffect(
    () => () => {
      runSeq.current += 1;
    },
    [],
  );

  const route: KeysRoute = keysCheck?.kind === "ok" ? keysCheck.route : "setup";
  const steps = ROUTE_STEPS[route];
  const step = steps[stepIndex].id;
  const setupFilled = SETUP_FIELDS.every((field) => inputs[field].trim() !== "");

  const clearSetupCheck = useCallback(() => {
    setupSeq.current += 1;
    setSetupPrecheck(null);
    setCheckingSetup(false);
  }, []);

  const setInputs = useCallback(
    (patch: Partial<WizardInputs>) => {
      setInputsState((prev) => ({ ...prev, ...patch }));
      if (patch.url !== undefined || patch.anonKey !== undefined) {
        checkSeq.current += 1;
        setKeysCheck(null);
        setCheckingKeys(false);
      }
      if (SETUP_FIELDS.some((field) => patch[field] !== undefined)) clearSetupCheck();
    },
    [clearSetupCheck],
  );

  /** 실행에 넘길 값 (② 확인에서 뽑은 프로젝트 id + ③ 입력값) */
  const secrets: SetupSecrets | null =
    keysCheck?.kind === "ok"
      ? {
          pat: inputs.pat,
          projectRef: keysCheck.ref,
          anthropicKey: inputs.anthropicKey,
          googleClientId: inputs.googleClientId,
          googleClientSecret: inputs.googleClientSecret,
        }
      : null;

  /** ④ 완료로 간다. 비밀값(PAT·키)은 여기서 버린다 (R18). */
  const goDone = useCallback((summary: DoneSummary) => {
    setInputsState((prev) => ({ ...EMPTY_INPUTS, url: prev.url, anonKey: prev.anonKey }));
    setDone(summary);
    setStepIndex(DONE_INDEX);
  }, []);

  const beginRun = useCallback(async (ctx: RunContext, from: RunProgress, startIndex: number) => {
    const seq = ++runSeq.current;
    setRunning(true);
    setRunOutcome(null);
    const outcome = await runSetup(
      ctx,
      from,
      startIndex,
      (progress) => {
        if (seq === runSeq.current) setRunProgress(progress);
      },
      () => seq !== runSeq.current,
    );
    if (seq !== runSeq.current) return;
    setRunning(false);
    setRunOutcome(outcome);
  }, []);

  /** 실행에 넘길 것: 비밀값, 앱 구조 번호, 로그인, 마무리 확인 결과 받기 */
  const runContext = useCallback(
    (values: SetupSecrets): RunContext | null => {
      if (keysCheck?.kind !== "ok") return null;
      return {
        secrets: values,
        appSchema: keysCheck.appSchema,
        login: login.login,
        onVerified: (health) => {
          verifiedRef.current = health;
        },
      };
    },
    [keysCheck, login.login],
  );

  // 여섯 단계가 모두 끝나면 로그인한 상태로 ④ 완료 (R19)
  useEffect(() => {
    if (runOutcome !== "done" || keysCheck?.kind !== "ok") return;
    const health = verifiedRef.current;
    goDone({
      url: keysCheck.url,
      email: health?.email ?? null,
      schema: health?.schema ?? null,
      appSchema: keysCheck.appSchema,
      keyRegisteredAt: health?.keyRegisteredAt ?? null,
      viaSetup: true,
    });
  }, [runOutcome, keysCheck, goDone]);

  /** 실행 화면으로 바꾸고 1단계부터 시작한다 */
  const enterRun = useCallback(
    (values: SetupSecrets) => {
      const ctx = runContext(values);
      if (!ctx) return;
      const fresh = initialRunProgress();
      setRunProgress(fresh);
      setSetupPhase("run");
      void beginRun(ctx, fresh, 0);
    },
    [beginRun, runContext],
  );

  const retryRun = useCallback(() => {
    if (running || !secrets || !runProgress.failure) return;
    const ctx = runContext(secrets);
    if (ctx) void beginRun(ctx, runProgress, runProgress.failure.index);
  }, [running, secrets, runProgress, beginRun, runContext]);

  /** 로그인으로 끝나는 갈래: health로 요약을 채워 ④ 완료로 (읽지 못하면 아는 값만) */
  const finishLogin = useCallback(
    async (session: ServerSession) => {
      if (keysCheck?.kind !== "ok") return;
      const health = await fetchHealth(session.client);
      const info = health.ok ? health.value : null;
      goDone({
        url: keysCheck.url,
        email: info?.email ?? session.email,
        schema: info?.schema ?? keysCheck.schema,
        appSchema: keysCheck.appSchema,
        keyRegisteredAt: info?.keyRegisteredAt ?? null,
        viaSetup: false,
      });
    },
    [keysCheck, goDone],
  );

  const startLogin = useCallback(async () => {
    const result = await login.startLogin();
    if (!result?.ok) return;
    // 서버 번호가 앱보다 낮으면 로그인 뒤 서버 업데이트 화면을 먼저 보여준다 (R23)
    if (route === "login-update") {
      setUpdateSession(result.session);
      return;
    }
    await finishLogin(result.session);
  }, [login, finishLogin, route]);

  const finishUpdate = useCallback(() => {
    if (!updateSession || updateRunning) return;
    void finishLogin(updateSession);
  }, [updateSession, updateRunning, finishLogin]);

  const startSetup = useCallback(async () => {
    if (keysCheck?.kind !== "ok" || !setupFilled) return;
    const seq = ++setupSeq.current;
    setCheckingSetup(true);
    setSetupPrecheck(null);
    const result = await runSetupPrecheck(inputs.anthropicKey, inputs.pat, keysCheck.ref);
    if (seq !== setupSeq.current) return;
    setCheckingSetup(false);
    setSetupPrecheck(result);
    if (result.kind === "ok" && secrets) enterRun(secrets);
  }, [keysCheck, setupFilled, inputs.anthropicKey, inputs.pat, secrets, enterRun]);

  const confirmNotEmpty = useCallback(() => {
    setSetupPrecheck(null);
    if (secrets) enterRun(secrets);
  }, [secrets, enterRun]);

  const dismissNotEmpty = useCallback(() => {
    setSetupPrecheck(null);
  }, []);

  const runKeysCheck = useCallback(async () => {
    const seq = ++checkSeq.current;
    setCheckingKeys(true);
    setKeysCheck(null);
    const result = await checkKeys(inputs.url, inputs.anonKey);
    if (seq !== checkSeq.current) return;
    setKeysCheck(result);
    setCheckingKeys(false);
  }, [inputs.url, inputs.anonKey]);

  const canGoNext = step === "prepare" || (step === "keys" && keysCheck?.kind === "ok" && !checkingKeys);

  const next = useCallback(() => {
    if (!canGoNext) return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [canGoNext, steps.length]);

  const resetRun = useCallback(() => {
    runSeq.current += 1;
    setRunProgress(initialRunProgress());
    setRunning(false);
    setRunOutcome(null);
  }, []);

  const prev = useCallback(() => {
    if (running || updateSession) return;
    login.cancelLogin();
    clearSetupCheck();
    // ③ 실행 화면에서 [이전]은 같은 단계의 입력 화면으로
    if (step === "setup" && setupPhase === "run") {
      resetRun();
      setSetupPhase("input");
      return;
    }
    setStepIndex((i) => Math.max(i - 1, 0));
  }, [running, login, clearSetupCheck, resetRun, step, setupPhase]);

  const cancel = useCallback(() => {
    // 실행 중에는 서버를 바꾸는 요청이 가고 있어 취소를 막는다
    if (running || updateRunning) return;
    login.cancelLogin();
    resetRun();
    checkSeq.current += 1;
    clearSetupCheck();
    setInputsState(EMPTY_INPUTS);
    setKeysCheck(null);
    setCheckingKeys(false);
    setSetupPhase("input");
    setStepIndex(0);
    setUpdateSession(null);
    onClose();
  }, [running, updateRunning, login, resetRun, onClose, clearSetupCheck]);

  const finish = useCallback(() => {
    setInputsState(EMPTY_INPUTS);
    onClose();
  }, [onClose]);

  return {
    step,
    stepIndex,
    steps,
    route,
    inputs,
    setInputs,
    keysCheck,
    checkingKeys,
    runKeysCheck,
    setupPhase,
    setupFilled,
    setupPrecheck,
    checkingSetup,
    startSetup,
    confirmNotEmpty,
    dismissNotEmpty,
    runProgress,
    running,
    runOutcome,
    retryRun,
    login,
    startLogin,
    updateSession,
    setUpdateRunning,
    finishUpdate,
    done,
    finish,
    canCancel: !running && !updateRunning,
    canGoPrev: stepIndex > 0 && step !== "done" && !checkingSetup && !running && !updateSession,
    canGoNext,
    next,
    prev,
    cancel,
  };
}
