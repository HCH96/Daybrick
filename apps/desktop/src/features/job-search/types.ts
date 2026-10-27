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
  /** Storage 파일 크기(바이트). 붙여 넣은 텍스트나 읽지 못했으면 null */
  sizeBytes: number | null;
}

/** 프로필 항목 하나: 값과 출처 자료 이름들. 자료에 없으면 value는 null (R20) */
export interface ProfileTextField {
  value: string | null;
  sources: string[];
}

export type SkillLevel = "high" | "mid" | "low";

export interface ProfileSkill {
  name: string;
  level: SkillLevel;
}

/** 경력·프로젝트 한 줄 (R19) */
export interface ProfileExperience {
  /** 회사·팀·역할 또는 프로젝트 이름 */
  title: string;
  period: string | null;
  did: string | null;
  results: string | null;
  tech: string[];
  sources: string[];
}

/** 프로필 내용 (`js_profiles.data`, `js_profile_drafts.data`). 서버 `_shared/prompts.ts`의 PROFILE_SCHEMA와 같은 모양 */
export interface ProfileData {
  desiredRoles: ProfileTextField;
  years: ProfileTextField;
  skills: { items: ProfileSkill[]; sources: string[] };
  experiences: ProfileExperience[];
  education: ProfileTextField;
  awards: ProfileTextField;
  strengths: ProfileTextField;
}

/** 저장한 프로필 한 버전 (`js_profiles`). sources는 저장할 때 있던 자료 이름 목록 */
export interface SavedProfile {
  id: string;
  version: number;
  data: ProfileData;
  sources: string[];
  savedAt: string;
}

/** 저장 안 된 프로필 초안 (`js_profile_drafts`, 사용자당 하나) */
export interface ProfileDraft {
  data: ProfileData;
  createdAt: string;
}

/** 어댑터 (`js_adapters`). rule 모양은 D16 */
export interface Adapter {
  id: string;
  name: string;
  rule: unknown;
  version: number;
  builtin: boolean;
}

/** 사이트의 마지막 수집 결과 (`js_sites.last_result`, D31) */
export interface SiteLastResult {
  ok: boolean;
  /** 목록에서 읽은 공고 수 */
  read: number;
  /** 새로 저장한 공고 수 */
  added: number;
  reason: string | null;
}

/** 수집 사이트 (`js_sites`) */
export interface Site {
  id: string;
  name: string;
  url: string;
  adapterId: string | null;
  vars: Record<string, string>;
  enabled: boolean;
  /** 아직 수집한 적이 없으면 null */
  lastResult: SiteLastResult | null;
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
