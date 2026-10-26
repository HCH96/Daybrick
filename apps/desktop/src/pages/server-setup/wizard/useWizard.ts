import { useCallback, useState } from "react";

/** 마법사 단계. 진행 표시는 ①~④ 네 칸이고, 3단계 이후에 로그인 같은 갈래가 붙는다. */
export type WizardStepId = "prepare" | "keys" | "setup" | "done";

export const WIZARD_STEPS: readonly { id: WizardStepId; label: string }[] = [
  { id: "prepare", label: "준비" },
  { id: "keys", label: "주소·키" },
  { id: "setup", label: "자동 세팅" },
  { id: "done", label: "완료" },
];

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
  inputs: WizardInputs;
  setInputs: (patch: Partial<WizardInputs>) => void;
  canGoPrev: boolean;
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

  const setInputs = useCallback((patch: Partial<WizardInputs>) => {
    setInputsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1));
  }, []);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const cancel = useCallback(() => {
    setInputsState(EMPTY_INPUTS);
    setStepIndex(0);
    onClose();
  }, [onClose]);

  return {
    step: WIZARD_STEPS[stepIndex].id,
    stepIndex,
    inputs,
    setInputs,
    canGoPrev: stepIndex > 0,
    next,
    prev,
    cancel,
  };
}
