import { useEffect, useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Modal from "../../../components/common/Modal";
import { CloseIcon, MaximizeIcon, RestoreIcon, TrashIcon } from "../../../components/icons/DialogIcons";
import { useApplications } from "../../../features/applications/store";
import PropertyList from "../properties/PropertyList";
import SaveStateLabel from "./SaveStateLabel";
import StatusRow from "./StatusRow";
import TitleInput from "./TitleInput";
import "./ApplicationDetailModal.css";

interface ApplicationDetailModalProps {
  applicationId: string;
  onClose: () => void;
}

/**
 * 카드 상세 팝업 (R12~R16).
 * 머리: 왼쪽 최대화 / 오른쪽 저장 표시 → 삭제 → 닫기.
 * 내용: 제목 → 상태 배지 → 속성 목록 → (본문은 7단계에서 채움) (R14)
 */
function ApplicationDetailModal({ applicationId, onClose }: ApplicationDetailModalProps) {
  const { state, saveStatus, updateApplication, deleteApplication } = useApplications();
  const [maximized, setMaximized] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const application =
    state.kind === "ready" ? state.data.applications.find((a) => a.id === applicationId) : undefined;

  // 카드가 사라졌으면(삭제 등) 팝업도 닫는다
  useEffect(() => {
    if (!application) onClose();
  }, [application, onClose]);

  if (!application || state.kind !== "ready") return null;
  const properties = state.data.properties;

  const deleteName = application.title || "제목 없음";

  return (
    <Modal onClose={onClose} maximized={maximized} ariaLabel={`${deleteName} 상세`}>
      <div className="detail-modal__top">
        <button
          type="button"
          className="detail-modal__btn"
          title={maximized ? "원래 크기로" : "최대화"}
          aria-label={maximized ? "원래 크기로" : "최대화"}
          onClick={() => setMaximized((m) => !m)}
        >
          {maximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <div className="detail-modal__right">
          <SaveStateLabel status={saveStatus} />
          <button
            type="button"
            className="detail-modal__btn"
            title="삭제"
            aria-label="삭제"
            onClick={() => setConfirmingDelete(true)}
          >
            <TrashIcon />
          </button>
          <button type="button" className="detail-modal__btn" title="닫기" aria-label="닫기" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="detail-modal__scroll">
        <div className="detail-modal__inner">
          <TitleInput value={application.title} onChange={(title) => updateApplication(application.id, { title })} />
          <StatusRow application={application} properties={properties} />
          <PropertyList application={application} properties={properties} />
          <div className="detail-modal__divider" />
          {/* 본문 편집기(7단계)를 만들기 전까지 쓰는 임시 안내 */}
          <div className="detail-modal__placeholder">본문은 다음 단계에서 만들어요</div>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="이 지원을 삭제할까요?"
          message={`"${deleteName}"의 속성, 일정, 본문이 모두 지워지고 되돌릴 수 없어요.`}
          confirmLabel="삭제"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            deleteApplication(application.id);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

export default ApplicationDetailModal;
