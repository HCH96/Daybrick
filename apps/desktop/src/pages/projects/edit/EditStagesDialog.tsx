import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { DateIcon, FlagIcon } from "../../../components/icons/PlanIcons";
import type { StageEdit } from "../../../features/plan/reducer";
import { usePlan } from "../../../features/plan/store";
import type { Project, Stage } from "../../../features/plan/types";
import { stageTasks } from "../../../features/projects/progress";
import { startOfWeek } from "../../../utils/date";
import StageListEditor, { type StageDraft } from "../create/StageListEditor";
import WeeklyEditor, { MAX_WEEKS, MIN_WEEKS } from "../create/WeeklyEditor";
import RemoveStageConfirm, { type StageTarget } from "./RemoveStageConfirm";
import "../create/Create.css";
import "./Edit.css";

interface EditStagesDialogProps {
  project: Project;
  onClose: () => void;
}

/** 저장하면 없어지는 단계 중 태스크가 있는 것 (확인 창에 하나씩 묻는다) */
interface PendingRemoval {
  stageId: string;
  label: string;
  taskCount: number;
}

/** 주차형 빈 이름은 "N주차" */
function labelOf(project: Project, stage: Stage, index: number): string {
  return project.kind === "weekly" ? stage.name || `${index + 1}주차` : stage.name;
}

/**
 * 단계·주차 편집 창 (프로젝트 R13·R14). 만들기 창의 단계 목록 / 주차 입력을 그대로 쓰고, 종류는 보여주기만 한다.
 * 단계형: 추가·삭제·이름·끌어서 순서. 비운 새 줄은 빼고, 있던 단계의 이름을 비우면 저장을 막는다.
 * 주차형: 시작 주·주 수·주차 이름. 주 수를 줄이면 뒤 주차가 없어진다.
 * `저장`을 누르면 없어지는 단계 중 태스크가 있는 것마다 확인 창을 띄우고, 다 고르면 한 번에 바꾼다(D5).
 * 확인 창에서 `취소`하면 아무것도 바꾸지 않고 이 창으로 돌아온다.
 */
function EditStagesDialog({ project, onClose }: EditStagesDialogProps) {
  const { state, editStages } = usePlan();
  const tasks = state.kind === "ready" ? state.data.tasks : [];
  const weekly = project.kind === "weekly";
  const thisWeek = startOfWeek(new Date());

  const [drafts, setDrafts] = useState<StageDraft[]>(() => project.stages.map((s) => ({ key: s.id, name: s.name })));
  const [startWeek, setStartWeek] = useState(project.startWeek ?? thisWeek);
  const [weekCount, setWeekCount] = useState(project.stages.length);
  const [weekNames, setWeekNames] = useState<string[]>(() => project.stages.map((s) => s.name));
  // 확인 창 차례: 물을 단계 목록과 지금까지 고른 답
  const [queue, setQueue] = useState<PendingRemoval[]>([]);
  const [answers, setAnswers] = useState<StageEdit["removed"]>([]);

  const oldIds = new Set(project.stages.map((s) => s.id));
  const nextStages: Stage[] = weekly
    ? Array.from({ length: weekCount }, (_, i) => ({
        id: project.stages[i]?.id ?? `new-week-${i}`,
        name: (weekNames[i] ?? "").trim(),
      }))
    : drafts
        .map((d) => ({ id: d.key, name: d.name.trim() }))
        .filter((s) => s.name !== "" || oldIds.has(s.id));
  const emptyOld = !weekly && nextStages.some((s) => s.name === "");
  const canSave = nextStages.length > 0 && !emptyOld;

  const keptIds = new Set(nextStages.map((s) => s.id));
  const goneStages = project.stages.map((s, i) => ({ stage: s, i })).filter(({ stage }) => !keptIds.has(stage.id));
  const targets: StageTarget[] = nextStages.map((s, i) => ({ id: s.id, label: labelOf(project, s, i) }));

  const commit = (removed: StageEdit["removed"]) => {
    // 주차형 새 주차는 저장할 때 진짜 id를 받는다. 옮길 곳으로 고른 새 주차 id도 같이 바꾼다.
    const realIds = new Map(nextStages.map((s) => [s.id, oldIds.has(s.id) ? s.id : crypto.randomUUID()]));
    editStages(project.id, {
      stages: nextStages.map((s) => ({ id: realIds.get(s.id) ?? s.id, name: s.name })),
      startWeek: weekly ? startWeek : undefined,
      removed: [
        ...removed.map((r) => ({ ...r, moveTo: r.moveTo === null ? null : realIds.get(r.moveTo) ?? r.moveTo })),
        ...goneStages.filter(({ stage }) => !removed.some((r) => r.stageId === stage.id)).map(({ stage }) => ({ stageId: stage.id, moveTo: null })),
      ],
    });
    onClose();
  };

  const save = () => {
    if (!canSave) return;
    const pending = goneStages
      .map(({ stage, i }) => ({ stageId: stage.id, label: labelOf(project, stage, i), taskCount: stageTasks(tasks, stage.id).length }))
      .filter((p) => p.taskCount > 0);
    if (pending.length === 0) {
      commit([]);
      return;
    }
    setAnswers([]);
    setQueue(pending);
  };

  const decide = (moveTo: string | null) => {
    const [current, ...rest] = queue;
    const next = [...answers, { stageId: current.stageId, moveTo }];
    if (rest.length === 0) {
      setQueue([]);
      commit(next);
      return;
    }
    setAnswers(next);
    setQueue(rest);
  };

  const title = weekly ? "주차 편집" : "단계 편집";
  const asking = queue[0];

  return (
    <Modal onClose={onClose} ariaLabel={title} className="proj-create">
      <form
        className="proj-create__body"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <h3 className="proj-create__title">{title}</h3>
        <div className="proj-field">
          <span className="proj-field__label">종류</span>
          <div className="proj-kinds">
            <div className="proj-kind proj-kind--on proj-kind--fixed">
              <b>
                {weekly ? <DateIcon size={16} /> : <FlagIcon size={16} />}
                {weekly ? "주차형" : "단계형"}
              </b>
              <span>{project.name}</span>
            </div>
          </div>
          <span className="proj-hint">만든 뒤에는 종류를 바꿀 수 없어요</span>
        </div>
        {weekly ? (
          <WeeklyEditor
            thisWeek={thisWeek}
            startWeek={startWeek}
            weekCount={weekCount}
            weekNames={weekNames}
            onStartWeek={setStartWeek}
            onWeekCount={(n) => setWeekCount(Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, n)))}
            onWeekName={(index, value) =>
              setWeekNames((prev) => {
                const next = [...prev];
                while (next.length <= index) next.push("");
                next[index] = value;
                return next;
              })
            }
          />
        ) : (
          <div className="proj-field">
            <span className="proj-field__label">단계 (최소 1개)</span>
            <StageListEditor items={drafts} onChange={setDrafts} />
            {emptyOld && <span className="proj-hint proj-hint--warn">있던 단계의 이름은 비울 수 없어요</span>}
          </div>
        )}
        <div className="proj-create__foot">
          <button type="button" className="proj-btn proj-btn--ghost" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="proj-btn proj-btn--primary" disabled={!canSave}>
            저장
          </button>
        </div>
      </form>
      {asking && (
        <RemoveStageConfirm
          key={asking.stageId}
          stageLabel={asking.label}
          taskCount={asking.taskCount}
          targets={targets}
          onDecide={decide}
          onCancel={() => {
            setQueue([]);
            setAnswers([]);
          }}
        />
      )}
    </Modal>
  );
}

export default EditStagesDialog;
