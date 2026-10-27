interface ListHeadProps {
  title: string;
  count: number;
  desc: string;
}

/** 걸러진 공고·보관함 머리: 제목 개수 / 설명. 추천 공고로 돌아가기는 위쪽 [추천 공고] 탭으로 한다 */
function ListHead({ title, count, desc }: ListHeadProps) {
  return (
    <>
      <div className="js-list__head">
        <h2>{title}</h2>
        <span className="js-list__count">{count}개</span>
      </div>
      <p className="js-list__desc">{desc}</p>
    </>
  );
}

export default ListHead;
