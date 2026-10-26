import {
  applyMigrations,
  configureAuth,
  deployFunctions,
  setSecrets,
  type ApiErrorKind,
  type ApiResult,
} from "./management";

/**
 * ③ 자동 세팅 실행 (R15–R17).
 * 여섯 단계를 차례로 실행하고, 단계마다 대기·진행·완료·실패를 알린다.
 * 실패하면 거기서 멈추고, 다시 시도하면 실패한 단계부터 이어간다.
 * C++로 치면 "단계 객체 배열을 돌며 run()을 부르는 상태 기계"다.
 */

export type RunStepId = "auth" | "schema" | "functions" | "secrets" | "account" | "verify";
export type RunStepState = "wait" | "run" | "done" | "fail";

export interface RunStepDef {
  id: RunStepId;
  name: string;
  /** 이름 아래 작은 글씨: 무엇을 하는지 */
  desc: string;
}

export const RUN_STEPS: readonly RunStepDef[] = [
  { id: "auth", name: "인증 설정", desc: "Google 로그인 켜기, 이메일 로그인 끄기" },
  { id: "schema", name: "서버 구조 적용", desc: "테이블·접근 규칙" },
  { id: "functions", name: "서버 함수 배포", desc: "health, ai-key-check" },
  { id: "secrets", name: "비밀값 등록", desc: "Anthropic 키, Google 클라이언트 값" },
  { id: "account", name: "계정 등록", desc: "브라우저에서 Google 로그인" },
  { id: "verify", name: "마무리 확인", desc: "접속·비밀값 동작 확인" },
];

/** 실행에 쓰는 값. 메모리에만 두고 넘겨받기만 한다 (R18). */
export interface SetupSecrets {
  pat: string;
  projectRef: string;
  anthropicKey: string;
  googleClientId: string;
  googleClientSecret: string;
}

/** 화면에 그릴 단계 하나의 상태. detail이 있으면 작은 글씨를 이것으로 바꾼다. */
export interface RunStepView {
  state: RunStepState;
  detail?: string;
}

export interface RunFailure {
  index: number;
  reason: ApiErrorKind;
}

export interface RunProgress {
  steps: RunStepView[];
  failure: RunFailure | null;
}

/** 단계 실행: 성공하면 작은 글씨에 보여줄 결과(없으면 null) */
type StepAction = (s: SetupSecrets) => Promise<ApiResult<string | null>>;

function withoutDetail(result: ApiResult<null>): ApiResult<string | null> {
  return result.ok ? { ok: true, value: null } : result;
}

/** 단계별 동작. 계정 등록·마무리 확인은 6단계 계획에서 붙인다 (지금은 여기서 멈춤). */
const ACTIONS: Partial<Record<RunStepId, StepAction>> = {
  auth: async (s) =>
    withoutDetail(await configureAuth(s.pat, s.projectRef, s.googleClientId, s.googleClientSecret)),
  schema: async (s) => {
    const result = await applyMigrations(s.pat, s.projectRef);
    if (!result.ok) return result;
    return { ok: true, value: `테이블·접근 규칙 ${result.value.from} → ${result.value.to}` };
  },
  functions: async (s) => withoutDetail(await deployFunctions(s.pat, s.projectRef)),
  secrets: async (s) =>
    withoutDetail(
      await setSecrets(s.pat, s.projectRef, s.anthropicKey, s.googleClientId, s.googleClientSecret),
    ),
};

export function initialRunProgress(): RunProgress {
  return { steps: RUN_STEPS.map(() => ({ state: "wait" })), failure: null };
}

/** 실행이 끝난 까닭: 모두 완료, 실패, 아직 화면이 없는 단계에 닿음, 바깥에서 멈춤 */
export type RunOutcome = "done" | "failed" | "pending" | "stopped";

/**
 * startIndex 단계부터 차례로 실행한다. 상태가 바뀔 때마다 onChange로 새 진행 상태를 넘긴다.
 * shouldStop()이 참이면 (마법사가 닫힘 등) 다음 단계로 가지 않고 알리지도 않는다.
 */
export async function runSetup(
  secrets: SetupSecrets,
  start: RunProgress,
  startIndex: number,
  onChange: (progress: RunProgress) => void,
  shouldStop: () => boolean,
): Promise<RunOutcome> {
  let steps = start.steps.map((step, i) => (i >= startIndex ? { ...step, state: "wait" as const } : step));
  const update = (index: number, view: RunStepView, failure: RunFailure | null = null) => {
    steps = steps.map((step, i) => (i === index ? view : step));
    onChange({ steps, failure });
  };

  for (let index = startIndex; index < RUN_STEPS.length; index++) {
    const action = ACTIONS[RUN_STEPS[index].id];
    if (!action) {
      onChange({ steps, failure: null });
      return "pending";
    }
    update(index, { state: "run" });
    const result = await action(secrets);
    if (shouldStop()) return "stopped";
    if (!result.ok) {
      update(index, { state: "fail" }, { index, reason: result.error });
      return "failed";
    }
    update(index, { state: "done", detail: result.value ?? undefined });
  }
  return "done";
}
