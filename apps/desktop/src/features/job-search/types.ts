import type { StatusId } from "../applications/types";

/**
 * 구직 관리 서버 데이터 모양 (plan/structure.md 2절, D14).
 * 서버 테이블 `js_*` 한 행을 앱에서 쓰는 이름(camelCase)으로 옮긴 것. 시각은 ISO 글자.
 */

/** 모델 하나의 단가: 100만 토큰당 달러 (R79, D23) */
export interface ModelPrice {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

/** 한도·단가 설정 (`js_settings`) */
export interface JsSettings {
  dailyLimit: number;
  monthlyLimitUsd: number;
  /** 모델 id → 단가 */
  prices: Record<string, ModelPrice>;
  profileVersion: number;
}

/** 기준 잔액 입력 기록 (`js_balance_records`, R76) */
export interface BalanceRecord {
  id: string;
  amountUsd: number;
  setAt: string;
}

/** AI 호출 기록 (`js_ai_calls`, R72) */
export interface AiCall {
  id: string;
  at: string;
  model: string;
  task: string;
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  costUsd: number;
  ok: boolean;
}

export type ProfileSourceKind = "pdf" | "md" | "text";

/** 프로필 자료 (`js_profile_sources`) */
export interface ProfileSource {
  id: string;
  name: string;
  kind: ProfileSourceKind;
  storagePath: string | null;
  text: string | null;
  createdAt: string;
}

/** 저장한 프로필 한 버전 (`js_profiles`). data 모양은 4단계에서 정한다 */
export interface SavedProfile {
  id: string;
  version: number;
  data: unknown;
  sources: unknown;
  savedAt: string;
}

/** 어댑터 (`js_adapters`). rule 모양은 D16 */
export interface Adapter {
  id: string;
  name: string;
  rule: unknown;
  version: number;
  builtin: boolean;
}

/** 수집 사이트 (`js_sites`) */
export interface Site {
  id: string;
  name: string;
  url: string;
  adapterId: string | null;
  vars: Record<string, string>;
  enabled: boolean;
  lastResult: unknown;
  lastAt: string | null;
}

/** 수집 기록 (`js_collect_runs`) */
export interface CollectRun {
  id: string;
  siteId: string | null;
  at: string;
  count: number;
  ok: boolean;
  reason: string | null;
}

/** 공고 처리 단계 */
export type PostingStage = "new" | "filtered1" | "extracted" | "filtered2" | "suspect" | "scored" | "waiting";

/** 공고 (`js_postings`) */
export interface Posting {
  id: string;
  siteId: string | null;
  extId: string | null;
  url: string | null;
  company: string | null;
  title: string | null;
  duty: string | null;
  normKey: string | null;
  bodyText: string | null;
  imagePaths: string[];
  collectedAt: string;
  stage: PostingStage;
  filteredBy: unknown;
  hiddenAt: string | null;
  appliedAt: string | null;
}

/** 추출 결과 (`js_extractions`, R48) */
export interface Extraction {
  postingId: string;
  fields: Record<string, unknown>;
  suspect: boolean;
  suspectQuotes: string[];
}

/** 채점 결과 (`js_scores`) */
export interface Score {
  postingId: string;
  profileVersion: number;
  score: number;
  grade: string;
  strengths: string[];
  gaps: string[];
  summary: string;
}

export type FilterKind =
  | "title-include"
  | "title-exclude"
  | "company-exclude"
  | "skill-include"
  | "skill-exclude"
  | "max-years"
  | "employment"
  | "skill-overlap";

/** 필터 조건 (`js_filters`, D10) */
export interface FilterRule {
  id: string;
  stage: 1 | 2;
  kind: FilterKind;
  value: unknown;
  enabled: boolean;
}

/** 지원 건 요약 (`js_applications`, D1) */
export interface ServerApplication {
  id: string;
  postingId: string | null;
  company: string;
  domain: string | null;
  cardId: string | null;
  status: StatusId;
  closed: boolean;
}

export type SuggestionState = "pending" | "approved" | "rejected";

/** 메일 제안 (`js_mail_suggestions`) */
export interface MailSuggestion {
  id: string;
  applicationId: string | null;
  subject: string;
  sender: string;
  receivedAt: string | null;
  category: string;
  fromStatus: StatusId | null;
  toStatus: StatusId | null;
  stage: string | null;
  schedule: unknown;
  quote: string;
  state: SuggestionState;
  handledAt: string | null;
}

/** Gmail 연결 상태 (`js_gmail_status` 보기). 행이 없으면 연결 안 됨 */
export interface GmailStatus {
  connected: boolean;
  email: string | null;
  lastCheckedAt: string | null;
}
