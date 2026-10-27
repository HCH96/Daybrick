import { useCallback, useEffect, useState } from "react";
import Modal from "../../../components/common/Modal";
import { useApplications } from "../../../features/applications/store";
import { createServerApplication, markPostingApplied } from "../../../features/job-search/applyApi";
import { buildCard, mailDomain } from "../../../features/job-search/buildCard";
import { daysLeft } from "../../../features/job-search/dday";
import {
  APPLY_NOT_READY,
  appliedMarkWarning,
  applyErrorMessage,
  FORCE_SCORING,
  POSTING_GONE,
  forceCallErrorMessage,
  forceDoneMessage,
  forceFailMessage,
  hideErrorMessage,
  postingLoadErrorMessage,
  restoreErrorMessage,
} from "../../../features/job-search/messages";
import {
  forceScore,
  loadPostingDetail,
  setPostingHidden,
  signImageUrls,
  type PostingDetail,
} from "../../../features/job-search/postingApi";
import { shortDay } from "../../../features/job-search/postingFormat";
import {
  suggestSchedule,
  toScheduleEvents,
  type SuggestedEvent,
  type VagueEvent,
} from "../../../features/job-search/scheduleSuggest";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import type { ApiErrorKind } from "../../../features/server/management";
import "../../server-setup/wizard/WizardShell.css";
import type { StatusLine } from "../profile/profileFormat";
import FieldTable from "./FieldTable";
import ImageZoom from "./ImageZoom";
import InjectionAlert from "./InjectionAlert";
import PopupFoot, { type FootBusy, type FootMode } from "./PopupFoot";
import PopupHead from "./PopupHead";
import ReasonList from "./ReasonList";
import ScheduleSuggestDialog from "./ScheduleSuggestDialog";
import ScoreBox from "./ScoreBox";
import SourceView from "./SourceView";
import "./PostingPopup.css";

interface PostingPopupProps {
  postingId: string;
  onClose: () => void;
  /** 지원 안 함·되돌리기·그래도 채점·지원하기 뒤 목록과 개수를 다시 읽게 알린다 */
  onChanged: () => void;
}

/** 지원하기를 마친 뒤 일정 제안 창에 넘기는 값 */
interface AppliedState {
  cardId: string;
  cardName: string;
  events: SuggestedEvent[];
  vague: VagueEvent[];
  warning: string | null;
}

const STAGE_NAMES: Partial<Record<PostingDetail["stage"], string>> = {
  filtered1: "1차 필터",
  filtered2: "2차 필터",
  waiting: "채점 대기",
};

function footMode(detail: PostingDetail): FootMode {
  if (detail.hiddenAt) return "archived";
  return detail.score ? "scored" : "unscored";
}

function footNote(detail: PostingDetail, mode: FootMode, profileVersion: number, expired: boolean): string {
  if (mode === "archived") {
    return `${detail.hiddenAt ? shortDay(detail.hiddenAt) : ""} 보관${expired ? " · 마감 지남" : ""}`;
  }
  if (mode === "scored" && detail.score) {
    const current = detail.score.profileVersion >= profileVersion ? "현재 프로필 기준" : "이전 프로필 기준";
    return `프로필 v${detail.score.profileVersion}로 채점 · ${current}`;
  }
  const why = detail.suspect ? "인젝션 의심" : (STAGE_NAMES[detail.stage] ?? "채점 전");
  return `걸린 조건: ${why} · ${shortDay(detail.collectedAt)} 수집`;
}

/** 공고 상세 팝업 (R10–R15, R46, R49): 1040px, 창 높이에 맞춤, 본문 2열 */
function PostingPopup({ postingId, onClose, onChanged }: PostingPopupProps) {
  const { session, data: shared } = useJobSearch();
  const [detail, setDetail] = useState<PostingDetail | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  const [busy, setBusy] = useState<FootBusy>(null);
  const [status, setStatus] = useState<StatusLine>(null);
  const [applied, setApplied] = useState<AppliedState | null>(null);
  const applications = useApplications();

  const load = useCallback(async () => {
    const result = await loadPostingDetail(session, postingId);
    if (!result.ok) {
      setLoadError(result.error);
      return;
    }
    setLoadError(null);
    setDetail(result.value);
  }, [session, postingId]);

  useEffect(() => {
    void load();
  }, [load]);

  const paths = detail?.imagePaths.join("\n") ?? "";
  useEffect(() => {
    if (!paths) return;
    let alive = true;
    void signImageUrls(session, paths.split("\n")).then((r) => {
      if (!alive) return;
      if (r.ok && r.value.length > 0) setImageUrls(r.value);
      else setImageError(true);
    });
    return () => {
      alive = false;
    };
  }, [session, paths]);

  async function setHidden(hidden: boolean) {
    setBusy(hidden ? "hide" : "restore");
    setStatus(null);
    const result = await setPostingHidden(session, postingId, hidden);
    setBusy(null);
    if (!result.ok) {
      setStatus({ ok: false, text: hidden ? hideErrorMessage(result.error) : restoreErrorMessage(result.error) });
      return;
    }
    onChanged();
    onClose();
  }

  async function force() {
    setBusy("force");
    setStatus({ ok: true, text: FORCE_SCORING });
    const result = await forceScore(session, postingId);
    if (!result.ok) setStatus({ ok: false, text: forceCallErrorMessage(result.error) });
    else if (!result.value.ok) setStatus({ ok: false, text: forceFailMessage(result.value) });
    else {
      setStatus({ ok: true, text: forceDoneMessage(result.value.stage) });
      await load();
      onChanged();
    }
    setBusy(null);
  }

  /** 지원하기 (R54–R57): 서버 지원 건 → 로컬 카드(`jobLink`) → 공고 `applied_at` → 일정 제안 */
  async function apply(posting: PostingDetail) {
    if (applications.state.kind !== "ready") {
      setStatus({ ok: false, text: APPLY_NOT_READY });
      return;
    }
    const { properties } = applications.state.data;
    setBusy("apply");
    setStatus(null);
    const cardId = crypto.randomUUID();
    const created = await createServerApplication(session, {
      postingId: posting.id,
      company: posting.company ?? "",
      domain: mailDomain(posting.url),
      cardId,
      status: "preparing",
    });
    if (!created.ok) {
      setBusy(null);
      setStatus({ ok: false, text: applyErrorMessage(created.error) });
      return;
    }
    const { events, vague } = suggestSchedule(posting.fields);
    const { card, options } = buildCard(posting, properties, vague, {
      cardId,
      serverId: created.value,
      now: new Date().toISOString(),
      newId: () => crypto.randomUUID(),
    });
    applications.createFromJob(card, options);
    const marked = await markPostingApplied(session, posting.id);
    setBusy(null);
    onChanged();
    const warning = marked.ok ? null : appliedMarkWarning(marked.error);
    // 제안할 날짜도 알릴 것도 없으면 창을 띄우지 않는다 (목업 메모)
    if (events.length === 0 && !warning) {
      onClose();
      return;
    }
    const cardName = [posting.company, posting.title].filter(Boolean).join(" · ");
    setApplied({ cardId, cardName, events, vague, warning });
  }

  if (applied) {
    return (
      <ScheduleSuggestDialog
        cardName={applied.cardName}
        events={applied.events}
        vague={applied.vague}
        warning={applied.warning}
        onAdd={(picked) => {
          applications.addEvents(applied.cardId, toScheduleEvents(picked, () => crypto.randomUUID()));
          onClose();
        }}
        onSkip={onClose}
      />
    );
  }

  if (!detail) {
    return (
      <Modal onClose={onClose} ariaLabel="공고 상세">
        <div className="js-popup js-popup--state">
          {loadError ? postingLoadErrorMessage(loadError) : detail === null ? POSTING_GONE : "공고를 읽는 중…"}
          {(loadError || detail === null) && (
            <button type="button" className="setup-btn" onClick={onClose}>
              닫기
            </button>
          )}
        </div>
      </Modal>
    );
  }

  const days = daysLeft(detail.fields?.deadline.date ?? null, new Date());
  const mode = footMode(detail);
  const expired = days !== null && days < 0;
  const source = (
    <SourceView
      bodyText={detail.bodyText}
      hasImages={detail.imagePaths.length > 0}
      imageUrls={imageUrls}
      imageError={imageError}
      onZoom={setZoom}
    />
  );
  return (
    <Modal onClose={onClose} ariaLabel={`${detail.company ?? ""} ${detail.title ?? "공고"} 상세`}>
      <div className="js-popup">
        {detail.suspect && <InjectionAlert quotes={detail.suspectQuotes} scored={detail.score !== null} />}
        <PopupHead detail={detail} days={days} onClose={onClose} />
        <div className="js-popup__body">
          <div className="js-popup__col">
            <ScoreBox detail={detail} />
            {detail.score ? (
              <ReasonList strengths={detail.score.strengths} gaps={detail.score.gaps} />
            ) : (
              <FieldTable fields={detail.fields} />
            )}
          </div>
          <div className="js-popup__col">
            {detail.score && <FieldTable fields={detail.fields} />}
            {source}
          </div>
        </div>
        <PopupFoot
          mode={mode}
          note={footNote(detail, mode, shared?.settings.profileVersion ?? 0, expired)}
          status={status}
          busy={busy}
          restoreDisabled={expired}
          onHide={() => void setHidden(true)}
          onRestore={() => void setHidden(false)}
          onForce={() => void force()}
          onApply={detail.appliedAt ? undefined : () => void apply(detail)}
        />
      </div>
      {zoom !== null && imageUrls && (
        <ImageZoom
          urls={imageUrls}
          start={zoom}
          title={[detail.company, detail.title].filter(Boolean).join(" · ")}
          onClose={() => setZoom(null)}
        />
      )}
    </Modal>
  );
}

export default PostingPopup;
