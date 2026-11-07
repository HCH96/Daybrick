import { useState } from "react";
import { NAV_LABELS } from "../../app/pageLabels";
import { usePageIntent } from "../../app/pageIntent";
import { JobSearchProvider } from "../../features/job-search/JobSearchProvider";
import { useServer } from "../../features/server/useServer";
import JobSearchTabs from "./JobSearchTabs";
import JobSearchDisconnected from "./JobSearchDisconnected";
import TabPlaceholder from "./TabPlaceholder";
import FiltersTab from "./filters/FiltersTab";
import MailTab from "./mail/MailTab";
import { useMailCount } from "./mail/useMailCount";
import ProfileTab from "./profile/ProfileTab";
import RecommendTab from "./recommend/RecommendTab";
import JobSettingsTab from "./settings/JobSettingsTab";
import SourcesTab from "./sources/SourcesTab";
import { JOB_SEARCH_TABS, isJobSearchTab, type JobSearchTabId } from "./tabs";
import "./JobSearchPage.css";

/** 탭 내용. 만든 탭은 실제 컴포넌트, 아직 안 만든 탭은 자리 표시 (D22) */
function TabBody({
  tab,
  label,
  onMailCount,
}: {
  tab: JobSearchTabId;
  label: string;
  onMailCount: (count: number) => void;
}) {
  switch (tab) {
    case "mail":
      return <MailTab onPendingChange={onMailCount} />;
    case "settings":
      return <JobSettingsTab />;
    case "profile":
      return <ProfileTab />;
    case "sources":
      return <SourcesTab />;
    case "filters":
      return <FiltersTab />;
    case "recommend":
      return <RecommendTab />;
    default:
      return <TabPlaceholder label={label} />;
  }
}

/** 구직 관리 화면: 제목 + 탭 6개 (R1). 서버 연결·로그인이 안 됐으면 탭 대신 연결 안내 (R2). */
function JobSearchPage() {
  const { config, sessionReady, serverSession, status } = useServer();
  const [tab, setTab] = useState<JobSearchTabId>("recommend");
  // 추천 공고 탭에서 보관함·걸러진 공고를 보다가 [추천 공고] 탭을 다시 누르면 카드 목록으로 돌아간다
  const [recommendReset, setRecommendReset] = useState(0);

  function selectTab(next: JobSearchTabId) {
    if (next === tab && next === "recommend") setRecommendReset((n) => n + 1);
    setTab(next);
  }

  // 알림 등에서 탭을 지정해 열면 그 탭으로 바꾼다
  usePageIntent("job-search", (intent) => {
    if (intent.tab && isJobSearchTab(intent.tab)) setTab(intent.tab);
  });

  // 연결 정보·로그인 복원을 읽는 중에는 안내가 잠깐 깜빡이지 않도록 아무것도 그리지 않는다
  const loading = config === null || !sessionReady;
  const connected = serverSession !== null && status === "connected";
  const label = JOB_SEARCH_TABS.find((t) => t.id === tab)?.label ?? "";
  const [mailCount, setMailCount] = useMailCount(connected ? serverSession : null);

  return (
    <div className="job-search-page">
      <h1 className="job-search-page__title">{NAV_LABELS["job-search"]}</h1>
      {!loading && !connected && <JobSearchDisconnected />}
      {!loading && connected && serverSession && (
        <JobSearchProvider key={serverSession.userId} session={serverSession}>
          <JobSearchTabs tab={tab} onChange={selectTab} mailCount={mailCount} />
          <div className="job-search-page__body" role="tabpanel">
            <TabBody key={tab === "recommend" ? `recommend-${recommendReset}` : tab} tab={tab} label={label} onMailCount={setMailCount} />
          </div>
        </JobSearchProvider>
      )}
    </div>
  );
}

export default JobSearchPage;
