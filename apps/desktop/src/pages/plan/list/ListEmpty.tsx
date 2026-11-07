import { ChecklistIcon } from "../../../components/icons/PlanIcons";

/** 태스크도 카테고리도 없을 때 목록 자리에 보이는 안내 (목업 plan-empty-list) */
function ListEmpty() {
  return (
    <div className="plan-list-empty">
      <span className="plan-list-empty__icon">
        <ChecklistIcon size={20} />
      </span>
      <b>아직 태스크가 없어요</b>
      <div>
        위 입력칸에 제목을 적고 Enter를 누르면
        <br />
        날짜 없는 태스크가 생겨요
      </div>
    </div>
  );
}

export default ListEmpty;
