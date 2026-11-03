/** 플랜 데이터 모양 (plan.json). 투데이·타이머·프로젝트도 나중에 같은 태스크를 쓴다. */

/** 카테고리. 순서는 배열 순서다 (D15). */
export interface Category {
  id: string;
  name: string;
  color: string; // "#RRGGBB"
}

/** 프로젝트 단계. 순서는 프로젝트 stages 배열 순서 (프로젝트 D5). 주차형 이름 ""는 "N주차"로 보인다. */
export interface Stage {
  id: string;
  name: string;
}

export type ProjectKind = "stage" | "weekly";

/** 프로젝트 (프로젝트 R9–R12). 진행률·완료 여부는 저장하지 않고 계산한다 (프로젝트 D3). */
export interface Project {
  id: string;
  name: string;
  color: string; // "#RRGGBB"
  kind: ProjectKind;
  startWeek: string | null; // 주차형: 1주차 월요일 "YYYY-MM-DD", 단계형 null
  stages: Stage[]; // 주차형은 주 수 = 길이
  goalSeenAt: string | null; // 골인 연출을 본 시각 (프로젝트 R25)
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
  stageId: string | null; // 프로젝트 단계. 값이 있으면 categoryId는 null (프로젝트 D2)
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
  stageFold: Record<string, boolean>; // 플랜 트리에서 직접 접고 편 단계 (true = 펼침, 프로젝트 R47)
  projectsDoneOpen: boolean; // 프로젝트 목록의 완료 묶음 펼침 (프로젝트 R6)
}

export interface PlanData {
  version: 1;
  categories: Category[];
  tasks: Task[];
  projects: Project[]; // 순서 = 진행 중 카드·트리 순서 (프로젝트 R7)
  view: PlanView;
}
