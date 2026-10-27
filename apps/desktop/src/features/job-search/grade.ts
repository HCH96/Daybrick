/** 채점 등급 (D36 `js_scores.grade`)의 이름·색. 목업 mockup.md "점수 색" */
export type GradeId = "strong" | "good" | "fair" | "low";

const GRADES: Record<GradeId, { label: string; tone: "green" | "accent" | "amber" | "muted" }> = {
  strong: { label: "강력 추천", tone: "green" },
  good: { label: "추천", tone: "accent" },
  fair: { label: "보통", tone: "amber" },
  low: { label: "낮음", tone: "muted" },
};

/** 서버가 준 등급 글자. 모르는 값이면 점수로 정한다 (80↑·60–79·40–59·40↓) */
export function toGrade(value: unknown, score: number): GradeId {
  if (value === "strong" || value === "good" || value === "fair" || value === "low") return value;
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "low";
}

export function gradeLabel(grade: GradeId): string {
  return GRADES[grade].label;
}

/** 색 이름: green 초록 · accent 보라 · amber 주황 · muted 회색 */
export function gradeTone(grade: GradeId): "green" | "accent" | "amber" | "muted" {
  return GRADES[grade].tone;
}
