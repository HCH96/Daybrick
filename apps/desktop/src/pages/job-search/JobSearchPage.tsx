import { useState } from "react";
import { usePageIntent } from "../../app/pageIntent";
import { useServer } from "../../features/server/useServer";
import JobSearchTabs from "./JobSearchTabs";
import JobSearchDisconnected from "./JobSearchDisconnected";
import TabPlaceholder from "./TabPlaceholder";
import { JOB_SEARCH_TABS, isJobSearchTab, type JobSearchTabId } from "./tabs";
import "./JobSearchPage.css";

/** 구직 관리 화면: 제목 + 탭 6개 (R1). 서버 연결·로그인이 안 됐으면 탭 대신 연결 안내 (R2). */
function JobSearchPage() {
  const { config, sessionReady, serverSession, status } = useServer();
  const [tab, setTab] = useState<JobSearchTabId>("recommend");

  // 알림 등에서 탭을 지정해 열면 그 탭으로 바꾼다
  usePageIntent("job-search", (intent) => {
    if (intent.tab && isJobSearchTab(intent.tab)) setTab(intent.tab);
  });

  // 연결 정보·로그인 복원을 읽는 중에는 안내가 잠깐 깜빡이지 않도록 아무것도 그리지 않는다
  const loading = config === null || !sessionReady;
  const connected = serverSession !== null && status === "connected";
  const label = JOB_SEARCH_TABS.find((t) => t.id === tab)?.label ?? "";

  return (
    <div className="job-search-page">
      <h1 className="job-search-page__title">구직 관리</h1>
      {!loading && !connected && <JobSearchDisconnected />}
      {!loading && connected && (
        <>
          <JobSearchTabs tab={tab} onChange={setTab} />
          <div className="job-search-page__body" role="tabpanel">
            <TabPlaceholder key={tab} label={label} />
          </div>
        </>
      )}
    </div>
  );
}

export default JobSearchPage;
