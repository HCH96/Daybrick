import { useEffect, useState } from "react";
import Popover from "../../../components/common/Popover";
import { LockIcon, PlayIcon } from "../../../components/icons/TodayIcons";
import { useToday } from "../../../features/today/store";

interface StartButtonProps {
  taskId: string;
  /** 다른 태스크의 타이머가 돌고 있으면 그 태스크 제목, 아니면 null (R11) */
  blockedBy: string | null;
}

/**
 * 칸반 카드의 타이머 시작 버튼 (R11, R26). ▶를 누르면 시작 흐름을 거쳐 타이머를 시작한다.
 * 다른 타이머가 돌면 자물쇠로 바뀌고, 누르면 이유를 말풍선으로 알린다 (목업 today-blocked).
 * 카드 클릭(상세 팝업)으로 번지지 않게 막는다.
 */
function StartButton({ taskId, blockedBy }: StartButtonProps) {
  const { requestStart } = useToday();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const blocked = blockedBy !== null;

  // 막힘이 풀리면 열려 있던 말풍선도 닫는다
  useEffect(() => {
    if (!blocked) setAnchor(null);
  }, [blocked]);

  return (
    <>
      <button
        type="button"
        className={blocked ? "kanban-card__play kanban-card__play--off" : "kanban-card__play"}
        aria-label={blocked ? "타이머 시작 불가: 다른 타이머가 돌고 있어요" : "타이머 시작"}
        title={blocked ? undefined : "타이머 시작"}
        onClick={(e) => {
          e.stopPropagation();
          if (blocked) setAnchor(anchor ? null : e.currentTarget);
          else requestStart(taskId);
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {blocked ? <LockIcon size={16} /> : <PlayIcon size={16} />}
      </button>
      {anchor && blockedBy !== null && (
        <Popover anchor={anchor} onClose={() => setAnchor(null)} placement="bottom-end" width={210} ariaLabel="타이머 시작 불가 이유" className="kanban-tip">
          {/* 겹침 층에 그려져도 React 이벤트는 카드로 번지므로 여기서 막는다 */}
          <div onClick={(e) => e.stopPropagation()}>
            다른 타이머가 돌고 있어요
            <span>"{blockedBy}"를 끝내거나 중단하면 시작할 수 있어요</span>
          </div>
        </Popover>
      )}
    </>
  );
}

export default StartButton;
