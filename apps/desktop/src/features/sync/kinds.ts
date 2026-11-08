import { invoke, isTauri } from "@tauri-apps/api/core";
import {
  APPLICATIONS_FILE_VERSION,
  createEmptyData as createEmptyApplicationsData,
  parseApplicationsData,
  saveApplicationsData,
} from "../applications/storage";
import type { ApplicationsData } from "../applications/types";
import {
  CALENDAR_FILE_VERSION,
  createEmptyCalendarData,
  parseCalendarData,
  saveCalendarData,
} from "../calendar/storage";
import type { CalendarData } from "../calendar/types";
import { PLAN_FILE_VERSION, createEmptyPlanData, parsePlanData, savePlanData } from "../plan/storage";
import type { PlanData } from "../plan/types";
import { TODAY_FILE_VERSION, createEmptyTodayData, parseTodayData, saveTodayData } from "../today/storage";
import type { TodayData } from "../today/types";
import type { SyncKind } from "./types";

/** 로컬 파일 읽기 결과. 읽지 못한 종류는 올리지 않는다 (R13) */
export type LocalRead<T> =
  | { kind: "ok"; data: T; empty: boolean }
  | { kind: "unreadable"; message: string };

/**
 * 동기화하는 종류 하나 (R1). 목록에 없는 파일(images/, job-search.json 등)은 올리지 않는다 (R2).
 * 메서드 문법으로 써서 `KindDef<PlanData>` 등을 `KindDef<unknown>` 자리에 둘 수 있게 한다.
 */
export interface KindDef<T> {
  kind: SyncKind;
  /** 화면에 보이는 이름 */
  label: string;
  /** 지금 앱이 읽고 쓰는 파일 버전. 서버 데이터가 이보다 새 버전이면 받지 않는다 (R22) */
  fileVersion: number;
  /** 로컬 파일을 읽어 검사한다. 파일이 없으면 빈 데이터 (D8, D10) */
  readLocal(): Promise<LocalRead<T>>;
  /** 검사를 통과한 데이터로 로컬 파일을 덮는다 (기존 저장 명령) */
  writeLocal(data: T): Promise<void>;
  /** 서버에서 받은 data(JSON 값)를 검사해 쓸 수 있는 데이터로 바꾼다. 틀리면 예외 (R22) */
  parse(value: unknown): T;
  /** "빈 데이터"인지 (plan/index.md 작은 규칙, R15) */
  isEmpty(data: T): boolean;
}

interface KindParts<T> {
  kind: SyncKind;
  label: string;
  fileVersion: number;
  loadCommand: string;
  createEmpty: () => T;
  parseRaw: (raw: string) => T;
  save: (data: T) => Promise<void>;
  isEmpty: (data: T) => boolean;
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return typeof e === "string" ? e : "파일을 읽지 못했습니다.";
}

function defineKind<T>(parts: KindParts<T>): KindDef<T> {
  return {
    kind: parts.kind,
    label: parts.label,
    fileVersion: parts.fileVersion,
    async readLocal() {
      if (!isTauri()) return { kind: "ok", data: parts.createEmpty(), empty: true };
      try {
        const raw = await invoke<string | null>(parts.loadCommand);
        const data = raw === null ? parts.createEmpty() : parts.parseRaw(raw);
        return { kind: "ok", data, empty: parts.isEmpty(data) };
      } catch (e) {
        return { kind: "unreadable", message: errorMessage(e) };
      }
    },
    writeLocal(data) {
      return parts.save(data);
    },
    parse(value) {
      return parts.parseRaw(JSON.stringify(value));
    },
    isEmpty(data) {
      return parts.isEmpty(data);
    },
  };
}

const plan = defineKind<PlanData>({
  kind: "plan",
  label: "플랜",
  fileVersion: PLAN_FILE_VERSION,
  loadCommand: "load_plan",
  createEmpty: createEmptyPlanData,
  parseRaw: parsePlanData,
  save: savePlanData,
  isEmpty: (d) => d.categories.length === 0 && d.tasks.length === 0 && d.projects.length === 0,
});

const calendar = defineKind<CalendarData>({
  kind: "calendar",
  label: "캘린더",
  fileVersion: CALENDAR_FILE_VERSION,
  loadCommand: "load_calendar",
  createEmpty: createEmptyCalendarData,
  parseRaw: parseCalendarData,
  save: saveCalendarData,
  isEmpty: (d) => d.events.length === 0,
});

const applications = defineKind<ApplicationsData>({
  kind: "applications",
  label: "지원 관리",
  fileVersion: APPLICATIONS_FILE_VERSION,
  loadCommand: "load_applications",
  createEmpty: createEmptyApplicationsData,
  // v1 파일은 메모리에서만 v2로 옮긴다. 옮긴 파일 저장은 loadApplicationsData만 한다 (D10)
  parseRaw: parseApplicationsData,
  save: saveApplicationsData,
  isEmpty: (d) => d.applications.length === 0,
});

const today = defineKind<TodayData>({
  kind: "today",
  label: "투데이",
  fileVersion: TODAY_FILE_VERSION,
  loadCommand: "load_today",
  createEmpty: createEmptyTodayData,
  parseRaw: parseTodayData,
  save: saveTodayData,
  isEmpty: (d) => d.records.length === 0 && d.running === null,
});

/** 종류별 정의 (R1). 순서는 SYNC_KINDS와 같다 */
export const KINDS: Record<SyncKind, KindDef<unknown>> = { plan, calendar, applications, today };
