import type { EventKind, StageId, StatusId } from "./types";

export interface StatusDef {
  id: StatusId;
  label: string;
  hasStage: boolean; // 세부 단계를 고르는 상태인지
  color: string; // 글자·점 색 (CSS 변수)
  softColor: string; // 바탕 색 (CSS 변수)
}

/** 상태 목록 (고정, R19). 순서 = 상태 선택 창에 보이는 순서. 색은 목업에서 정한 값. */
export const STATUSES: readonly StatusDef[] = [
  { id: "preparing", label: "지원 준비", hasStage: false, color: "var(--neutral)", softColor: "var(--neutral-soft)" },
  { id: "applied", label: "지원 완료", hasStage: false, color: "var(--blue)", softColor: "var(--blue-soft)" },
  { id: "stage-prep", label: "전형 준비", hasStage: true, color: "var(--amber)", softColor: "var(--amber-soft)" },
  { id: "awaiting", label: "결과 대기", hasStage: true, color: "var(--green)", softColor: "var(--green-soft)" },
  { id: "closed", label: "종료", hasStage: false, color: "var(--muted)", softColor: "transparent" },
];

export const STAGES: readonly { id: StageId; label: string; shortLabel: string }[] = [
  { id: "assignment", label: "과제", shortLabel: "과제" },
  { id: "coding-test", label: "코딩테스트", shortLabel: "코테" },
  { id: "interview", label: "면접", shortLabel: "면접" },
];

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  applied: "지원 완료",
  "assignment-due": "과제 마감",
  "coding-test": "코딩테스트",
  interview: "면접",
};

export function findStatus(id: StatusId): StatusDef {
  const status = STATUSES.find((s) => s.id === id);
  if (!status) {
    throw new Error(`알 수 없는 상태: ${id}`);
  }
  return status;
}
