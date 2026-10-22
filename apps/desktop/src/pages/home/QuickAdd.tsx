import { PlusIcon } from "../../components/icons/StatusIcons";
import "./QuickAdd.css";

/**
 * 할 일 빠른 추가 입력칸 자리.
 * 할 일 기능이 아직 없으므로 비활성 상태로만 보여준다 (2026-10-22 결정).
 * 기능을 만들면 disabled를 풀고 입력 처리를 연결한다.
 */
function QuickAdd() {
  return (
    <label className="quick-add" title="할 일 기능을 만들면 사용할 수 있어요">
      <PlusIcon />
      <input
        className="quick-add__input"
        type="text"
        placeholder="할 일 기능을 만들면 사용할 수 있어요"
        aria-label="할 일 빠르게 추가 (준비 중)"
        disabled
      />
    </label>
  );
}

export default QuickAdd;
