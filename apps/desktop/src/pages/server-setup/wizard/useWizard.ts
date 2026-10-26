import { useCallback, useEffect, useRef, useState } from "react";
import { runSetupPrecheck, type SetupPrecheck } from "../../../features/server/management";
import { checkKeys, type KeysCheck, type KeysRoute } from "../../../features/server/probe";
import {
  initialRunProgress,
  runSetup,
  type RunOutcome,
  type RunProgress,
  type SetupSecrets,
} from "../../../features/server/setupRunner";

/**
 * 마법사 단계. 진행 표시는 ①~④ 네 칸이고, 셋째 칸은 ② 확인 결과(갈래)에 따라 바뀐다 (R6).
 * login·app-update는 6·8단계에서 화면을 붙인다.
 */
export type WizardStepId = "prepare" | "keys" | "setup" | "login" | "app-update" | "done";

export interface WizardStepInfo {
  id: WizardStepId;
  label: string;
}

const PREPARE: WizardStepInfo = { id: "prepare", label: "준비" };
const KEYS: WizardStepInfo = { id: "keys", label: "주소·키" };
const DONE: WizardStepInfo = { id: "done", label: "완료" };

/** 갈래마다 네 칸. 서버 업데이트(login-update)는 로그인 뒤에 8단계에서 끼워 넣는다. */
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

  const beginRun = useCallback(async (values: SetupSecrets, from: RunProgress, startIndex: number) => {
    const seq = ++runSeq.current;
    setRunning(true);
    setRunOutcome(null);
    const outcome = await runSetup(
      values,
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

  /** 실행 화면으로 바꾸고 1단계부터 시작한다 */
  const enterRun = useCallback(
    (values: SetupSecrets) => {
      const fresh = initialRunProgress();
      setRunProgress(fresh);
      setSetupPhase("run");
      void beginRun(values, fresh, 0);
    },
    [beginRun],
  );

  const retryRun = useCallback(() => {
    if (running || !secrets || !runProgress.failure) return;
    void beginRun(secrets, runProgress, runProgress.failure.index);
  }, [running, secrets, runProgress, beginRun]);

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
    if (running) return;
    clearSetupCheck();
    // ③ 실행 화면에서 [이전]은 같은 단계의 입력 화면으로
    if (step === "setup" && setupPhase === "run") {
      resetRun();
      setSetupPhase("input");
      return;
    }
    setStepIndex((i) => Math.max(i - 1, 0));
  }, [running, clearSetupCheck, resetRun, step, setupPhase]);

  const cancel = useCallback(() => {
    // 실행 중에는 서버를 바꾸는 요청이 가고 있어 취소를 막는다
    if (running) return;
    resetRun();
    checkSeq.current += 1;
    clearSetupCheck();
    setInputsState(EMPTY_INPUTS);
    setKeysCheck(null);
    setCheckingKeys(false);
    setSetupPhase("input");
    setStepIndex(0);
    onClose();
  }, [running, resetRun, onClose, clearSetupCheck]);

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
    canCancel: !running,
    canGoPrev: stepIndex > 0 && !checkingSetup && !running,
    canGoNext,
    next,
    prev,
    cancel,
  };
}
