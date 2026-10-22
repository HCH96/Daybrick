import MiniCalendar from "../../../components/common/MiniCalendar";
import { EVENT_KIND_LABELS } from "../../../features/applications/statuses";
import type { StageId } from "../../../features/applications/types";

/** 세부 단계 → 창 제목에 쓸 일정 이름 (과제는 과제 마감 날짜를 고른다) */
const TITLE: Record<StageId, string> = {
  assignment: EVENT_KIND_LABELS["assignment-due"],
  "coding-test": EVENT_KIND_LABELS["coding-test"],
  interview: EVENT_KIND_LABELS.interview,
};

interface StageDatePickerProps {
  stage: StageId;
  onPick: (date: string) => void;
  onSkip: () => void;
}

/** 전형 준비의 세부 단계를 고른 뒤 이어서 뜨는 작은 달력 (R22). 건너뛸 수 있다. */
function StageDatePicker({ stage, onPick, onSkip }: StageDatePickerProps) {
  return (
    <div className="stage-date">
      <p className="stage-date__title">{TITLE[stage]} 날짜를 골라 주세요</p>
      <MiniCalendar value={null} onSelect={onPick} />
      <div className="stage-date__foot">
        <button type="button" className="pop-row stage-date__skip" onClick={onSkip}>
          건너뛰기
        </button>
      </div>
    </div>
  );
}

export default StageDatePicker;
