import { useCallback, useState } from "react";
import { useApplications } from "../../features/applications/store";
import { countEventsThisWeek, isActive, type GalleryTab } from "../../features/applications/schedule";
import ApplicationsHeader, { type ApplicationsView } from "./ApplicationsHeader";
import GalleryView from "./gallery/GalleryView";
import CalendarView from "./calendar/CalendarView";
import ApplicationDetailModal from "./detail/ApplicationDetailModal";
import "./ApplicationsPage.css";

/** 지원 관리 화면: 머리줄 + 갤러리/달력 + 상세 팝업 (R1·R12) */
function ApplicationsPage() {
  const { state, createApplication } = useApplications();
  const [view, setView] = useState<ApplicationsView>("gallery");
  // 달력을 다녀와도 고른 탭이 유지되도록 페이지가 들고 있는다
  const [tab, setTab] = useState<GalleryTab>("active");
  // 상세 팝업으로 연 카드 (R12). 달력에서도 같은 팝업을 연다 (R11).
  const [openId, setOpenId] = useState<string | null>(null);
  const closeDetail = useCallback(() => setOpenId(null), []);

  const applications = state.kind === "ready" ? state.data.applications : [];
  const activeCount = applications.filter(isActive).length;
  const subtitle = `진행 중 ${activeCount}곳 · 이번 주 일정 ${countEventsThisWeek(applications, new Date())}개`;

  return (
    <div className="applications-page">
      <ApplicationsHeader
        subtitle={subtitle}
        view={view}
        onViewChange={setView}
        onCreate={() => createApplication()}
        canCreate={state.kind === "ready"}
      />
      {state.kind === "loading" && <div className="applications-page__notice">불러오는 중…</div>}
      {state.kind === "error" && (
        <div className="applications-page__notice applications-page__notice--error">
          저장된 데이터를 읽지 못했어요. 기존 파일을 지키기 위해 저장을 멈췄어요.
          <br />({state.message})
        </div>
      )}
      {state.kind === "ready" && view === "gallery" && (
        <GalleryView
          applications={applications}
          properties={state.data.properties}
          tab={tab}
          onTabChange={setTab}
          onOpen={setOpenId}
        />
      )}
      {state.kind === "ready" && view === "calendar" && (
        <CalendarView applications={applications} onOpen={setOpenId} />
      )}
      {state.kind === "ready" && openId !== null && (
        <ApplicationDetailModal applicationId={openId} onClose={closeDetail} />
      )}
    </div>
  );
}

export default ApplicationsPage;
