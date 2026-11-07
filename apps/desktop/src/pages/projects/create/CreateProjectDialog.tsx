import { useState, type ReactNode } from "react";
import Modal from "../../../components/common/Modal";
import { DateIcon, FlagIcon } from "../../../components/icons/PlanIcons";
import { usePlan } from "../../../features/plan/store";
import type { ProjectKind } from "../../../features/plan/types";
import { startOfWeek } from "../../../utils/date";
import ColorChoice, { PROJECT_COLORS } from "./ColorChoice";
import StageListEditor, { newStageDraft, type StageDraft } from "./StageListEditor";
import WeeklyEditor, { MAX_WEEKS, MIN_WEEKS } from "./WeeklyEditor";
import "./Create.css";

/** 주차형 처음 주 수 */
const DEFAULT_WEEKS = 4;

interface CreateProjectDialogProps {
  onClose: () => void;
}

/**
 * 프로젝트 만들기 창 (프로젝트 R5, R9–R12, 목업 part-create.html).
 * 이름 · 색 · 종류(만든 뒤 못 바꿈) · 단계형이면 단계 목록 / 주차형이면 시작 주·주 수·주차 이름.
 * 이름이 비었거나 이름 있는 단계가 하나도 없으면 `만들기`를 막는다. 빈 이름 단계는 빼고 만든다.
 */
function CreateProjectDialog({ onClose }: CreateProjectDialogProps) {
  const { state, addProject, pushRecentColor } = usePlan();
  const recentColors = state.kind === "ready" ? state.data.view.recentColors : [];
  const thisWeek = startOfWeek(new Date());

  const [name, setName] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [kind, setKind] = useState<ProjectKind>("stage");
  const [stages, setStages] = useState<StageDraft[]>(() => [newStageDraft()]);
  const [startWeek, setStartWeek] = useState(thisWeek);
  const [weekCount, setWeekCount] = useState(DEFAULT_WEEKS);
  const [weekNames, setWeekNames] = useState<string[]>([]);

  const trimmed = name.trim();
  const stageNames = stages.map((s) => s.name.trim()).filter((n) => n !== "");
  const canCreate = trimmed !== "" && (kind === "weekly" || stageNames.length > 0);

  const create = () => {
    if (!canCreate) return;
    const id =
      kind === "stage"
        ? addProject({ kind, name: trimmed, color, stageNames })
        : addProject({ kind, name: trimmed, color, startWeek, weekCount, weekNames: weekNames.slice(0, weekCount) });
    if (id === null) return;
    pushRecentColor(color);
    onClose();
  };

  return (
    <Modal onClose={onClose} ariaLabel="새 프로젝트" className="proj-create">
      <form
        className="proj-create__body"
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
      >
        <h3 className="proj-create__title">새 프로젝트</h3>
        <label className="proj-field">
          <span className="proj-field__label">이름</span>
          <input
            className="proj-input"
            value={name}
            placeholder="프로젝트 이름"
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="proj-field">
          <span className="proj-field__label">색</span>
          <ColorChoice value={color} onChange={setColor} recentColors={recentColors} />
        </div>
        <div className="proj-field">
          <span className="proj-field__label">종류</span>
          <div className="proj-kinds" role="radiogroup" aria-label="종류">
            <KindOption on={kind === "stage"} onPick={() => setKind("stage")} title="단계형" desc="단계 이름을 순서대로 적기">
              <FlagIcon size={16} />
            </KindOption>
            <KindOption on={kind === "weekly"} onPick={() => setKind("weekly")} title="주차형" desc="시작 주·주 수로 자동 생성">
              <DateIcon size={16} />
            </KindOption>
          </div>
          <span className="proj-hint">만든 뒤에는 종류를 바꿀 수 없어요</span>
        </div>
        {kind === "stage" ? (
          <div className="proj-field">
            <span className="proj-field__label">단계 (최소 1개)</span>
            <StageListEditor items={stages} onChange={setStages} />
          </div>
        ) : (
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
        )}
        <div className="proj-create__foot">
          <button type="button" className="proj-btn proj-btn--ghost" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="proj-btn proj-btn--primary" disabled={!canCreate}>
            만들기
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface KindOptionProps {
  on: boolean;
  onPick: () => void;
  title: string;
  desc: string;
  children: ReactNode;
}

function KindOption({ on, onPick, title, desc, children }: KindOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      className={on ? "proj-kind proj-kind--on" : "proj-kind"}
      onClick={onPick}
    >
      <b>
        {children}
        {title}
      </b>
      <span>{desc}</span>
    </button>
  );
}

export default CreateProjectDialog;
