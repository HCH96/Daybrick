import { useState, type KeyboardEvent } from "react";
import { PlusIcon } from "../../components/icons/StatusIcons";
import { usePlan } from "../../features/plan/store";
import "./QuickAdd.css";

interface QuickAddProps {
  todayKey: string; // "YYYY-MM-DD"
}

/**
 * 홈 빠른 추가 (R12, R22, D5). Enter로 플랜 태스크를 하나 만든다: 미분류, 오늘 하루짜리, 시작 전.
 * 공백만 있으면 무시하고, 만든 뒤 입력칸을 비우고 포커스를 그대로 둔다. 화면은 이동하지 않는다.
 * 플랜 데이터가 준비 전이라 만들지 못하면(addTask가 null) 입력을 지우지 않는다.
 */
function QuickAdd({ todayKey }: QuickAddProps) {
  const { addTask } = usePlan();
  const [title, setTitle] = useState("");

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (title.trim() === "") return;
    const id = addTask(title.trim(), null, { start: todayKey, end: todayKey });
    if (id !== null) setTitle("");
  };

  return (
    <div className="quick-add">
      <label className="quick-add__box">
        <PlusIcon />
        <input
          className="quick-add__input"
          type="text"
          value={title}
          placeholder="할 일 추가…"
          aria-label="오늘 할 일 빠르게 추가"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <kbd className="quick-add__kbd">Enter</kbd>
      </label>
      <div className="quick-add__hint">플랜에 오늘 할 일로 추가돼요 (미분류)</div>
    </div>
  );
}

export default QuickAdd;
