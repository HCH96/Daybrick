import type { ReactNode } from "react";
import { ChevronRightIcon } from "../../../components/icons/CommonIcons";

interface DoneFoldProps {
  count: number;
  open: boolean;
  onToggle: () => void;
  /** 펼쳤을 때 보일 완료 카드들 */
  children: ReactNode;
}

/**
 * 목록 아래 `▸ 완료 N개` 접힌 묶음 (프로젝트 R6, 목업 projects-done).
 * 펼침은 plan.json view.projectsDoneOpen에 저장한다. 완료가 0개면 줄째로 숨긴다.
 */
function DoneFold({ count, open, onToggle, children }: DoneFoldProps) {
  if (count === 0) return null;
  return (
    <>
      <button
        type="button"
        className={open ? "proj-done proj-done--open" : "proj-done"}
        aria-expanded={open}
        onClick={onToggle}
      >
        <ChevronRightIcon size={12} />
        완료 <span className="proj-done__cnt">{count}개</span>
      </button>
      {open && <div className="proj-list">{children}</div>}
    </>
  );
}

export default DoneFold;
