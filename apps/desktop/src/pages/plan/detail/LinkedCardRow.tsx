import { useState, type ReactNode } from "react";
import { PlusIcon, SmallCloseIcon } from "../../../components/icons/CommonIcons";
import { LinkIcon } from "../../../components/icons/PlanIcons";
import { useApplications } from "../../../features/applications/store";
import { findLinkCard } from "../../../features/plan/applicationLinks";
import { usePlan } from "../../../features/plan/store";
import type { Task } from "../../../features/plan/types";
import StatusBadge from "../../applications/status/StatusBadge";
import CardPickDialog from "./CardPickDialog";
import "./CardPickDialog.css";

interface LinkedCardRowProps {
  task: Task;
  /** 카드 이름을 누르면 지원관리 상세 팝업을 연다 (D16) */
  onOpenApplication: (applicationId: string) => void;
}

/**
 * 상세 팝업 속성 줄 "지원 카드" (목업 popup-props·popup-bare, R39).
 * 연결이 없으면 "+ 지원 카드 연결", 있으면 카드 제목(밑줄)·회사·상태 배지와 [연결 끊기].
 * 지원 데이터를 읽는 중·읽지 못했을 때는 연결을 그대로 두고 안내 글자만 보인다 (D14).
 */
function LinkedCardRow({ task, onOpenApplication }: LinkedCardRowProps) {
  const { state } = useApplications();
  const { linkApplication } = usePlan();
  const [pickAnchor, setPickAnchor] = useState<HTMLElement | null>(null);

  const linkedId = task.applicationId;
  const card = linkedId !== null && state.kind === "ready" ? findLinkCard(state.data, linkedId, new Date()) : null;

  const unlink = (
    <button type="button" className="task-detail__txt-btn" onClick={() => linkApplication(task.id, null)}>
      <SmallCloseIcon size={12} />
      연결 끊기
    </button>
  );

  let value: ReactNode;
  if (linkedId !== null && state.kind !== "ready") {
    value = (
      <>
        <span className="task-card-link__note">
          {state.kind === "loading" ? "지원 카드를 불러오는 중…" : "지원 데이터를 읽지 못했어요."}
        </span>
        {unlink}
      </>
    );
  } else if (card) {
    value = (
      <>
        <span className="task-card-link">
          <button
            type="button"
            className="task-card-link__name"
            title="지원 상세 열기"
            onClick={() => onOpenApplication(card.application.id)}
          >
            {card.title}
          </button>
          {card.company && <span className="task-card-link__co">{card.company}</span>}
          <StatusBadge status={card.application.status} stage={card.application.stage} />
        </span>
        {unlink}
      </>
    );
  } else {
    // 연결이 없거나, 연결된 카드가 막 지워져 useLinkCleanup이 끊기 직전인 경우
    value = (
      <button
        type="button"
        className="task-detail__txt-btn task-detail__txt-btn--add"
        aria-haspopup="dialog"
        aria-expanded={pickAnchor !== null}
        onClick={(e) => {
          const target = e.currentTarget;
          setPickAnchor((a) => (a ? null : target));
        }}
      >
        <PlusIcon size={12} />
        지원 카드 연결
      </button>
    );
  }

  return (
    <>
      <span className="task-detail__label">
        <LinkIcon size={15} />
        지원 카드
      </span>
      <div className="task-detail__val">{value}</div>
      {pickAnchor && (
        <CardPickDialog
          anchor={pickAnchor}
          onPick={(applicationId) => linkApplication(task.id, applicationId)}
          onClose={() => setPickAnchor(null)}
        />
      )}
    </>
  );
}

export default LinkedCardRow;
