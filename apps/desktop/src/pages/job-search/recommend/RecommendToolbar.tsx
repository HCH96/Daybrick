import { ChevronDownIcon } from "../../../components/icons/CommonIcons";
import { RESCORING, staleNote } from "../../../features/job-search/messages";
import { SORT_OPTIONS, type RecommendSort } from "../../../features/job-search/sortPostings";
import { ArchiveIcon, FilterIcon, SortIcon } from "./RecommendIcons";

interface RecommendToolbarProps {
  sort: RecommendSort;
  onSort: (sort: RecommendSort) => void;
  /** 화면에 보이는 추천 공고 수 */
  count: number;
  /** 이전 프로필 기준 공고 수 (R23). 0이면 안내를 숨긴다 */
  staleCount: number;
  rescoring: boolean;
  onRescore: () => void;
  archived: number;
  filtered: number;
  /** 보관함·걸러진 공고 목록 열기 (11단계에서 붙인다). 없으면 단추를 막아 둔다 */
  onOpenArchived?: () => void;
  onOpenFiltered?: () => void;
}

/** 도구 줄 (R5, R9, R23): 정렬, 추천 N개, 이전 프로필 안내 + [다시 채점], 오른쪽 보관함·걸러진 공고 */
function RecommendToolbar(props: RecommendToolbarProps) {
  const { sort, onSort, count, staleCount, rescoring, onRescore, archived, filtered } = props;
  return (
    <div className="js-recommend__toolbar">
      <label className="js-recommend__sort">
        <SortIcon />
        <span className="js-recommend__k">정렬</span>
        <select
          value={sort}
          aria-label="정렬"
          onChange={(e) => onSort(SORT_OPTIONS.find((o) => o.id === e.target.value)?.id ?? "score")}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon size={13} />
      </label>
      <span className="js-recommend__count">
        추천 <b>{count}</b>개
      </span>
      {staleCount > 0 && (
        <span className="js-recommend__stale-note">
          {rescoring ? RESCORING : staleNote(staleCount)}
          <button type="button" className="setup-btn setup-btn--sm" disabled={rescoring} onClick={onRescore}>
            다시 채점
          </button>
        </span>
      )}
      <div className="js-recommend__right">
        <button type="button" className="setup-btn" disabled={!props.onOpenArchived} onClick={props.onOpenArchived}>
          <ArchiveIcon />
          지원 안 함 보관함 <span className="js-recommend__n">{archived}</span>
        </button>
        <button type="button" className="setup-btn" disabled={!props.onOpenFiltered} onClick={props.onOpenFiltered}>
          <FilterIcon />
          걸러진 공고 <span className="js-recommend__n">{filtered}</span>
        </button>
      </div>
    </div>
  );
}

export default RecommendToolbar;
