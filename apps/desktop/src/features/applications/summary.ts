import { STAGES, STATUSES } from "./statuses";
import { isActive } from "./schedule";
import type { Application, StageId, StatusId } from "./types";

export interface StageCount {
  stage: StageId;
  label: string; // 짧은 이름 (과제·코테·면접)
  count: number;
}

export interface StatusCount {
  status: StatusId;
  label: string;
  color: string;
  softColor: string;
  count: number;
  /** 세부 단계가 있는 상태(전형 준비·결과 대기)만. 0개인 단계는 빼고 단계 순서대로. */
  stages: StageCount[];
}

export interface ApplicationsSummary {
  activeCount: number; // 진행 중(종료 아님) 카드 수
  statuses: StatusCount[]; // 종료를 뺀 상태들, 상태 목록 순서
}

/** 홈용 지원 요약 (R36–R37). 종료된 카드는 세지 않는다. */
export function summarizeApplications(applications: readonly Application[]): ApplicationsSummary {
  const active = applications.filter(isActive);

  const statuses = STATUSES.filter((s) => s.id !== "closed").map((def): StatusCount => {
    const inStatus = active.filter((a) => a.status === def.id);
    const stages = def.hasStage
      ? STAGES.map((stage) => ({
          stage: stage.id,
          label: stage.shortLabel,
          count: inStatus.filter((a) => a.stage === stage.id).length,
        })).filter((s) => s.count > 0)
      : [];
    return {
      status: def.id,
      label: def.label,
      color: def.color,
      softColor: def.softColor,
      count: inStatus.length,
      stages,
    };
  });

  return { activeCount: active.length, statuses };
}
