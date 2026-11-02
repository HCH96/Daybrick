/** 플랜 데이터 모양 (plan.json). 투데이·타이머·프로젝트도 나중에 같은 태스크를 쓴다. */

/** 카테고리. 순서는 배열 순서다 (D15). */
export interface Category {
  id: string;
  name: string;
  color: string; // "#RRGGBB"
}

export type TaskStatus = "todo" | "doing" | "done";

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Task {
  id: string; // crypto.randomUUID()
  title: string;
  categoryId: string | null; // null = 미분류
  status: TaskStatus;
  start: string | null; // "YYYY-MM-DD", start·end는 둘 다 있거나 둘 다 null
  end: string | null;
  memo: string; // 마크다운
  checklist: ChecklistItem[] | null; // null = 체크리스트 없음 (R37)
  applicationId: string | null;
  createdAt: string; // ISO 시각
  updatedAt: string;
  completedAt: string | null;
}

/** 화면 설정. 같은 파일 view 칸에 둔다 (D10). */
export interface PlanView {
  collapsed: string[]; // 접힌 카테고리 id, 미분류는 "none"
  showApplicationEvents: boolean; // 기본 true
  recentColors: string[]; // 최근 쓴 색, 최대 8개
}

export interface PlanData {
  version: 1;
  categories: Category[];
  tasks: Task[];
  view: PlanView;
}
