import { useMemo } from "react";
import SegmentedControl, { type SegmentOption } from "../../../components/common/SegmentedControl";
import { SortIcon } from "../../../components/icons/ApplicationIcons";
import { findPropertyByRole } from "../../../features/applications/properties";
import { filterByTab, sortByDeadline, type GalleryTab } from "../../../features/applications/schedule";
import type { Application, PropertyDef } from "../../../features/applications/types";
import ApplicationCard, { type CardProperties } from "./ApplicationCard";
import "./GalleryView.css";

interface GalleryViewProps {
  applications: readonly Application[];
  properties: readonly PropertyDef[];
  tab: GalleryTab;
  onTabChange: (tab: GalleryTab) => void;
  onOpen: (id: string) => void;
}

const EMPTY_TEXT: Record<GalleryTab, string> = {
  active: "진행 중인 지원이 없어요. 오른쪽 위 \"새 지원\"으로 카드를 만들어 보세요.",
  closed: "종료된 지원이 없어요.",
  all: "아직 지원 카드가 없어요. 오른쪽 위 \"새 지원\"으로 카드를 만들어 보세요.",
};

/** 갤러리: 진행 중·종료·전체 탭 + 마감일 순 카드 바둑판 (R3~R5) */
function GalleryView({ applications, properties, tab, onTabChange, onOpen }: GalleryViewProps) {
  const cardProperties = useMemo<CardProperties>(
    () => ({
      company: findPropertyByRole(properties, "company"),
      priority: findPropertyByRole(properties, "priority"),
      result: findPropertyByRole(properties, "result"),
    }),
    [properties],
  );

  const visible = useMemo(() => sortByDeadline(filterByTab(applications, tab)), [applications, tab]);

  const tabOptions: SegmentOption<GalleryTab>[] = [
    { value: "active", label: "진행 중", count: filterByTab(applications, "active").length },
    { value: "closed", label: "종료", count: filterByTab(applications, "closed").length },
    { value: "all", label: "전체", count: applications.length },
  ];

  const today = new Date();

  return (
    <section className="gallery">
      <div className="gallery__toolbar">
        <SegmentedControl options={tabOptions} value={tab} onChange={onTabChange} ariaLabel="지원 거르기" variant="tabs" />
        <div className="gallery__sort">
          <SortIcon />
          마감일 가까운 순
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="gallery__empty">{EMPTY_TEXT[tab]}</div>
      ) : (
        <div className="gallery__grid">
          {visible.map((application) => (
            <ApplicationCard key={application.id} application={application} properties={cardProperties} today={today} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}

export default GalleryView;
