import type { LoginErrorKind, LoginResult } from "./googleLogin";
import {
  applyMigrations,
  configureAuth,
  deployFunctions,
  disableSignup,
  setSecrets,
  type ApiErrorKind,
  type ApiResult,
} from "./management";
import { checkServerAiKey, fetchHealth, recordKeyRegistered, type HealthInfo } from "./serverFunctions";
import type { ServerSession } from "./session";

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
  /** 진행 중일 때 작은 글씨·오른쪽 글자를 바꿀 때 (브라우저 로그인 대기) */
  running?: { desc: string; label: string };
}

export const RUN_STEPS: readonly RunStepDef[] = [
  { id: "auth", name: "인증 설정", desc: "Google 로그인 켜기, 이메일 로그인 끄기" },
  { id: "schema", name: "서버 구조 적용", desc: "테이블·접근 규칙" },
  { id: "functions", name: "서버 함수 배포", desc: "health, ai-key-check" },
  { id: "secrets", name: "비밀값 등록", desc: "Anthropic 키, Google 클라이언트 값" },
  {
    id: "account",
    name: "계정 등록",
    desc: "브라우저에서 Google 로그인",
    running: { desc: "기본 브라우저에서 Google 로그인을 마쳐 주세요", label: "기다리는 중…" },
  },
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

/**
 * 단계 실패 원인: 관리 API·서버 오류, 로그인 실패,
 * key-check-failed(서버에서 Anthropic 키가 동작하지 않음), schema-mismatch(서버 구조 번호가 앱과 다름)
 */
export type RunErrorKind = ApiErrorKind | LoginErrorKind | "key-check-failed" | "schema-mismatch";

export interface RunFailure {
  index: number;
  reason: RunErrorKind;
}

export interface RunProgress {
  steps: RunStepView[];
  failure: RunFailure | null;
}

/**
 * 실행에 넘기는 것: 비밀값과, 화면(useWizard)이 맡는 로그인·결과 전달.
 * login()은 이미 로그인했으면 그 세션을 돌려준다 (다시 시도 때 브라우저를 또 열지 않게).
 */
export interface RunContext {
  secrets: SetupSecrets;
  /** 앱의 최신 서버 구조 번호 (마무리 확인에서 비교) */
  appSchema: number;
  login: () => Promise<LoginResult>;
  /** 마무리 확인에서 받은 health 결과 (④ 완료 요약에 씀) */
  onVerified: (health: HealthInfo) => void;
}

/** 단계 하나의 결과: 성공하면 작은 글씨에 보여줄 결과(없으면 null) */
export type StepResult = { ok: true; value: string | null } | { ok: false; error: RunErrorKind };

/** 단계 실행: 성공하면 작은 글씨에 보여줄 결과(없으면 null) */
type StepAction = (ctx: RunContext) => Promise<StepResult>;

function withoutDetail(result: ApiResult<null>): StepResult {
  return result.ok ? { ok: true, value: null } : result;
}

/** 5단계 계정 등록: 로그인 → 새 가입 막기 → 본인 행에 키 등록일 기록 (R29, D12, D29) */
async function registerAccount(ctx: RunContext): Promise<StepResult> {
  const login = await ctx.login();
  if (!login.ok) return login;
  const { pat, projectRef } = ctx.secrets;
  const signup = await disableSignup(pat, projectRef);
  if (!signup.ok) return signup;
  const recorded = await recordKeyRegistered(login.session, new Date().toISOString());
  if (!recorded.ok) return recorded;
  return { ok: true, value: login.session.email ? `${login.session.email}로 로그인` : null };
}

/**
 * 6단계 마무리 확인: health로 DB 읽기, ai-key-check로 비밀값 동작 확인 (D17).
 * 자동 세팅 다시 실행도 이것을 쓴다. 성공하면 health 결과를 돌려준다.
 */
export async function verifyServer(
  session: ServerSession,
  appSchema: number,
): Promise<{ ok: true; health: HealthInfo } | { ok: false; error: RunErrorKind }> {
  const health = await fetchHealth(session.client);
  if (!health.ok) return health;
  if (health.value.schema !== appSchema) return { ok: false, error: "schema-mismatch" };
  const key = await checkServerAiKey(session.client);
  if (!key.ok) return key;
  if (!key.value.ok) return { ok: false, error: "key-check-failed" };
  return { ok: true, health: health.value };
}

/** 마무리 확인 성공 때 단계 작은 글씨 */
export const VERIFIED_DETAIL = "접속·Anthropic 키 동작 확인";

/** 단계별 동작 */
const ACTIONS: Record<RunStepId, StepAction> = {
  auth: async ({ secrets: s }) =>
    withoutDetail(await configureAuth(s.pat, s.projectRef, s.googleClientId, s.googleClientSecret)),
  schema: async ({ secrets: s }) => {
    const result = await applyMigrations(s.pat, s.projectRef);
    if (!result.ok) return result;
    return { ok: true, value: `테이블·접근 규칙 ${result.value.from} → ${result.value.to}` };
  },
  functions: async ({ secrets: s }) => withoutDetail(await deployFunctions(s.pat, s.projectRef)),
  secrets: async ({ secrets: s }) =>
    withoutDetail(
      await setSecrets(s.pat, s.projectRef, s.anthropicKey, s.googleClientId, s.googleClientSecret),
    ),
  account: registerAccount,
  verify: async (ctx) => {
    // 계정 등록에서 로그인했으므로 브라우저를 다시 열지 않고 그 세션을 받는다
    const login = await ctx.login();
    if (!login.ok) return login;
    const verified = await verifyServer(login.session, ctx.appSchema);
    if (!verified.ok) return verified;
    ctx.onVerified(verified.health);
    return { ok: true, value: VERIFIED_DETAIL };
  },
};

/** 단계 목록의 시작 상태 (모두 대기). 서버 업데이트는 자기 단계 목록을 넘긴다. */
export function initialRunProgress(defs: readonly RunStepDef[] = RUN_STEPS): RunProgress {
  return { steps: defs.map(() => ({ state: "wait" })), failure: null };
}

/** 실행이 끝난 까닭: 모두 완료, 실패, 바깥에서 멈춤 */
export type RunOutcome = "done" | "failed" | "stopped";

/**
 * 단계 목록을 startIndex부터 차례로 실행하는 공통 고리 (자동 세팅·서버 업데이트가 함께 씀).
 * 상태가 바뀔 때마다 onChange로 새 진행 상태를 넘긴다.
 * shouldStop()이 참이면 (마법사가 닫힘 등) 다음 단계로 가지 않고 알리지도 않는다.
 */
export async function runSteps(
  count: number,
  actionAt: (index: number) => Promise<StepResult>,
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

  for (let index = startIndex; index < count; index++) {
    update(index, { state: "run" });
    const result = await actionAt(index);
    if (shouldStop()) return "stopped";
    if (!result.ok) {
      update(index, { state: "fail" }, { index, reason: result.error });
      return "failed";
    }
    update(index, { state: "done", detail: result.value ?? undefined });
  }
  return "done";
}

/** ③ 자동 세팅 여섯 단계를 startIndex부터 실행한다 */
export function runSetup(
  ctx: RunContext,
  start: RunProgress,
  startIndex: number,
  onChange: (progress: RunProgress) => void,
  shouldStop: () => boolean,
): Promise<RunOutcome> {
  const actionAt = (index: number) => ACTIONS[RUN_STEPS[index].id](ctx);
  return runSteps(RUN_STEPS.length, actionAt, start, startIndex, onChange, shouldStop);
}
