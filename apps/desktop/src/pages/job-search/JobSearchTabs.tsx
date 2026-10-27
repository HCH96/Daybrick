import { JOB_SEARCH_TABS, type JobSearchTabId } from "./tabs";
import "./JobSearchTabs.css";

interface JobSearchTabsProps {
  tab: JobSearchTabId;
  onChange: (tab: JobSearchTabId) => void;
  /** 메일 제안 탭 옆 개수 칩. 0이거나 없으면 숨긴다 (값은 14단계에서 채움) */
  mailCount?: number;
}

/** 밑줄 탭 6개 (R1). 선택된 탭은 굵게 + 보라 밑줄. */
function JobSearchTabs({ tab, onChange, mailCount = 0 }: JobSearchTabsProps) {
  return (
    <nav className="job-search-tabs" role="tablist" aria-label="구직 관리 탭">
      {JOB_SEARCH_TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={id === tab}
          className={`job-search-tabs__tab${id === tab ? " job-search-tabs__tab--on" : ""}`}
          onClick={() => onChange(id)}
        >
          {label}
          {id === "mail" && mailCount > 0 && <span className="job-search-tabs__count">{mailCount}</span>}
        </button>
      ))}
    </nav>
  );
}

export default JobSearchTabs;
