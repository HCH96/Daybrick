import ConfirmDialog from "../../components/common/ConfirmDialog";

interface SyncAccountDialogProps {
  /** 지금 로그인한 계정 이메일 (없으면 "지금 계정") */
  email: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 다른 계정으로 로그인했을 때 이 계정으로 동기화할지 묻는다 (R16).
 * 확인하면 rev·hash를 비우고 이 계정 서버와 다시 비교한다. 로컬·서버 어느 쪽도 지우지 않는다.
 */
function SyncAccountDialog({ email, onConfirm, onCancel }: SyncAccountDialogProps) {
  const who = email ? `${email} 계정` : "지금 계정";
  return (
    <ConfirmDialog
      title="이 계정으로 동기화"
      message={`${who}으로 동기화를 시작합니다. 이 계정의 서버 내용과 다시 비교합니다.`}
      note="PC와 원래 계정의 서버 데이터는 지워지지 않습니다"
      confirmLabel="이 계정으로 동기화"
      confirmTone="primary"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default SyncAccountDialog;
