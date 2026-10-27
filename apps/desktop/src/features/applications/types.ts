/** 지원 관리 데이터 모양. 화면과 무관한 순수 타입만 둔다. */

/** 상태 5개 (고정 목록, R19) */
export type StatusId = "preparing" | "applied" | "stage-prep" | "awaiting" | "closed";

/** 세부 단계 3개. 전형 준비·결과 대기일 때만 쓴다. */
export type StageId = "assignment" | "coding-test" | "interview";

/** 전형 일정 종류 (R25). 지원 마감은 카드당 하나 (R39). */
export type EventKind = "application-due" | "assignment-due" | "coding-test" | "interview";

/** 전형 일정 하나 (R23~R27). 속성 목록에는 나오지 않는다. */
export interface ScheduleEvent {
  id: string;
  kind: EventKind;
  date: string; // "YYYY-MM-DD" (현지 날짜)
  time: string | null; // "HH:mm", 선택
  memo: string; // 선택, 빈 문자열이면 없음
}

/** 속성 종류 7가지 (R29) */
export type PropertyType = "text" | "number" | "select" | "multi-select" | "date" | "url" | "checkbox";

/** 선택 항목 색 8가지 (목업 팔레트) */
export type OptionColor = "gray" | "blue" | "amber" | "green" | "red" | "violet" | "teal" | "pink";

/** 선택·다중 선택 속성의 항목 하나 */
export interface PropertyOption {
  id: string;
  name: string;
  color: OptionColor;
}

/**
 * 앱 기능이 의존하는 기본 속성의 역할.
 * 역할이 있는 속성은 종류를 바꿀 수 없다 (계획 결정 3). 이름·항목 변경과 삭제는 가능하다.
 */
export type PropertyRole = "priority" | "result" | "company";

/** 속성 정의 (모든 카드가 공유). 순서는 배열 순서를 따른다. */
export interface PropertyDef {
  id: string;
  name: string;
  type: PropertyType;
  options: PropertyOption[]; // 선택·다중 선택일 때만 의미가 있다
  builtin: boolean; // 기본 속성 여부
  role: PropertyRole | null;
}

/**
 * 속성 값. null = "없음" (R31).
 * select는 항목 id, multi-select는 항목 id 배열, date는 "YYYY-MM-DD".
 */
export type PropertyValue = string | number | boolean | string[] | null;

/** 지원 카드 하나 */
export interface Application {
  id: string;
  title: string; // 비어 있을 수 있음
  status: StatusId;
  stage: StageId | null; // 전형 준비·결과 대기일 때만
  values: Record<string, PropertyValue>; // 속성 id → 값
  events: ScheduleEvent[];
  body: string; // 마크다운
  createdAt: string; // ISO 날짜·시간
  updatedAt: string;
  /** 구직 관리가 만든 카드의 서버 지원 건(`js_applications.id`) 연결. 옛 카드·직접 만든 카드는 칸이 없다 (구직 관리 D20) */
  jobLink?: { serverId: string } | null;
}

/** 파일 전체 형식 (v2: 마감일·지원일 속성과 "지원 완료" 일정을 없앰, D20) */
export interface ApplicationsData {
  version: 2;
  properties: PropertyDef[];
  applications: Application[];
}
