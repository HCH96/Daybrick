/** 예시 데이터 basic: 플랜(카테고리·태스크·프로젝트)과 투데이 시간 기록 */
import { createEmptyPlanData } from "../../features/plan/storage";
import type { PlanData, Task } from "../../features/plan/types";
import { createEmptyTodayData } from "../../features/today/storage";
import type { TodayData } from "../../features/today/types";
import { at, day, monday } from "./dates";

export const TASK_IDS = {
  todayTodo: "fx-task-today-todo",
  todayDoing: "fx-task-today-doing",
  todayDone: "fx-task-today-done",
  overdue: "fx-task-overdue",
  multiDay: "fx-task-multi-day",
  later: "fx-task-later",
  unscheduled: "fx-task-unscheduled",
  checklist: "fx-task-checklist",
  interviewPrep: "fx-task-interview-prep",
  weeklyStage: "fx-task-weekly-stage",
  stageTask: "fx-task-stage",
} as const;

export function buildPlan(today: Date, interviewAppId: string): PlanData {
  const base = createEmptyPlanData();
  const created = at(today, -14, 9);
  const task = (id: string, title: string, over: Partial<Task>): Task => ({
    id, title, categoryId: "fx-cat-study", stageId: null, status: "todo", start: null, end: null,
    memo: "", checklist: null, applicationId: null, createdAt: created, updatedAt: created, completedAt: null, ...over,
  });
  const t = day(today, 0);
  return {
    ...base,
    categories: [
      { id: "fx-cat-study", name: "공부", color: "#4C7BF4" },
      { id: "fx-cat-job", name: "취업 준비", color: "#E0892B" },
      { id: "fx-cat-life", name: "생활", color: "#3FA36B" },
    ],
    projects: [
      { id: "fx-proj-weekly", name: "알고리즘 8주", color: "#8B5CF6", kind: "weekly", startWeek: monday(today, -1),
        stages: Array.from({ length: 8 }, (_, i) => ({ id: `fx-week-${i + 1}`, name: "" })), goalSeenAt: null },
      { id: "fx-proj-stage", name: "포트폴리오 사이트", color: "#0EA5A4", kind: "stage", startWeek: null,
        stages: [{ id: "fx-stage-plan", name: "기획" }, { id: "fx-stage-dev", name: "개발" }, { id: "fx-stage-ship", name: "배포" }], goalSeenAt: null },
    ],
    tasks: [
      task(TASK_IDS.todayTodo, "자료구조 복습", { start: t, end: t }),
      task(TASK_IDS.todayDoing, "자기소개서 다듬기", { categoryId: "fx-cat-job", status: "doing", start: t, end: t }),
      task(TASK_IDS.todayDone, "운영체제 강의 3강", { status: "done", start: t, end: t, completedAt: at(today, 0, 11) }),
      task(TASK_IDS.overdue, "네트워크 정리 노트", { start: day(today, -2), end: day(today, -2) }),
      task(TASK_IDS.multiDay, "CS 스터디 발표 준비", { start: day(today, 1), end: day(today, 3), memo: "발표 자료 10장 안팎" }),
      task(TASK_IDS.later, "장보기", { categoryId: "fx-cat-life", start: day(today, 5), end: day(today, 5) }),
      task(TASK_IDS.unscheduled, "읽을 책 고르기", { categoryId: "fx-cat-life" }),
      task(TASK_IDS.checklist, "포트폴리오 정리", { categoryId: "fx-cat-job", start: day(today, 2), end: day(today, 2),
        checklist: [{ id: "fx-ck-1", text: "프로젝트 3개 고르기", checked: true }, { id: "fx-ck-2", text: "스크린샷 찍기", checked: false }] }),
      task(TASK_IDS.interviewPrep, "면접 예상 질문 정리", { categoryId: "fx-cat-job", start: day(today, 1), end: day(today, 1), applicationId: interviewAppId }),
      task(TASK_IDS.weeklyStage, "그래프 문제 5개", { categoryId: null, stageId: "fx-week-2", start: t, end: t }),
      task(TASK_IDS.stageTask, "화면 구성 스케치", { categoryId: null, stageId: "fx-stage-plan", status: "done", completedAt: at(today, -3, 20) }),
    ],
  };
}

export function buildToday(today: Date): TodayData {
  const base = createEmptyTodayData();
  return {
    ...base,
    records: [
      { id: "fx-rec-1", taskId: TASK_IDS.todayDone, start: at(today, 0, 9), end: at(today, 0, 10, 30) },
      { id: "fx-rec-2", taskId: TASK_IDS.todayDoing, start: at(today, 0, 13), end: at(today, 0, 13, 50) },
      { id: "fx-rec-3", taskId: TASK_IDS.overdue, start: at(today, -1, 20), end: at(today, -1, 21, 15) },
      { id: "fx-rec-4", taskId: TASK_IDS.weeklyStage, start: at(today, -3, 19), end: at(today, -3, 20, 40) },
    ],
  };
}
