import { ChevronLeftIcon } from "../../../components/icons/CommonIcons";

interface ListHeadProps {
  title: string;
  count: number;
  desc: string;
  onBack: () => void;
}

/** 걸러진 공고·보관함 머리: [← 추천 공고] 제목 개수 / 설명 */
function ListHead({ title, count, desc, onBack }: ListHeadProps) {
  return (
    <>
      <div className="js-list__head">
        <button type="button" className="setup-btn setup-btn--ghost setup-btn--sm" onClick={onBack}>
          <ChevronLeftIcon size={13} />
          추천 공고
        </button>
        <h2>{title}</h2>
        <span className="js-list__count">{count}개</span>
      </div>
      <p className="js-list__desc">{desc}</p>
    </>
  );
}

export default ListHead;
