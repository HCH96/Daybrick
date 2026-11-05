interface DeleteConfirmRowProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/** 편집 팝오버 아래의 빨간 확인 줄 (목업 part-personal 5-4, R29). [지우기]를 한 번 더 눌러야 지운다 */
function DeleteConfirmRow({ onCancel, onConfirm }: DeleteConfirmRowProps) {
  return (
    <div className="cal-pe__confirm" role="alert">
      <span>이 일정을 지울까요?</span>
      <button type="button" className="cal-pe__btn" onClick={onCancel}>
        취소
      </button>
      <button type="button" className="cal-pe__btn cal-pe__btn--danger" autoFocus onClick={onConfirm}>
        지우기
      </button>
    </div>
  );
}

export default DeleteConfirmRow;
