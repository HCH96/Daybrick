import { useCallback, useRef, useState } from "react";
import { checkKeys, type KeysCheck, type KeysRoute } from "../../../features/server/probe";

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

/** 마법사에서 입력하는 값. 메모리에만 두고, 취소하면 모두 버린다 (R3). */
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

  const route: KeysRoute = keysCheck?.kind === "ok" ? keysCheck.route : "setup";
  const steps = ROUTE_STEPS[route];
  const step = steps[stepIndex].id;

  const setInputs = useCallback((patch: Partial<WizardInputs>) => {
    setInputsState((prev) => ({ ...prev, ...patch }));
    if (patch.url !== undefined || patch.anonKey !== undefined) {
      checkSeq.current += 1;
      setKeysCheck(null);
      setCheckingKeys(false);
    }
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

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const cancel = useCallback(() => {
    checkSeq.current += 1;
    setInputsState(EMPTY_INPUTS);
    setKeysCheck(null);
    setCheckingKeys(false);
    setStepIndex(0);
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
    canGoPrev: stepIndex > 0,
    canGoNext,
    next,
    prev,
    cancel,
  };
}
