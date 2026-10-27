import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addFileSource,
  addTextSource,
  deleteProfileSource,
  discardProfileDraft,
  generateProfile,
  loadProfileSources,
  loadProfileState,
  saveProfile,
  type ProfileState,
} from "../../../features/job-search/api";
import {
  PROFILE_GENERATED,
  SAVED_MESSAGE,
  draftDiscardErrorMessage,
  fileTooLargeMessage,
  profileCallErrorMessage,
  profileGenerateFailMessage,
  profileLoadErrorMessage,
  profileSaveErrorMessage,
  sourceAddErrorMessage,
  sourceDeleteErrorMessage,
  unsupportedFileMessage,
} from "../../../features/job-search/messages";
import {
  emptyProfile,
  fromForm,
  nextVersion,
  toForm,
  type ProfileForm,
} from "../../../features/job-search/profileDraft";
import type { ProfileSource } from "../../../features/job-search/types";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import type { ApiErrorKind } from "../../../features/server/management";
import "../../server-setup/wizard/WizardShell.css";
import ProfileEditor from "./ProfileEditor";
import { formatDayTime, type StatusLine } from "./profileFormat";
import SourcePanel from "./SourcePanel";
import "./ProfileTab.css";

/** 파일 하나의 크기 상한 (서버 함수는 PDF 합계 20MB까지 보낸다) */
const MAX_FILE_MB = 10;

function fileKind(name: string): "pdf" | "md" | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "md";
  return null;
}

/** 편집 칸에 처음 채울 값: 초안 → 저장된 최신 프로필 → 빈 프로필 (R22) */
function formFrom(state: ProfileState): ProfileForm {
  return toForm(state.draft?.data ?? state.latest?.data ?? emptyProfile());
}

/** 프로필 탭 (R17–R22): 왼쪽 자료·만들기, 오른쪽 항목별 편집 */
function ProfileTab() {
  const { session, refresh } = useJobSearch();
  const [sources, setSources] = useState<ProfileSource[] | null>(null);
  const [state, setState] = useState<ProfileState | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [leftStatus, setLeftStatus] = useState<StatusLine>(null);
  const [editorStatus, setEditorStatus] = useState<StatusLine>(null);

  const reloadSources = useCallback(async () => {
    const result = await loadProfileSources(session);
    if (result.ok) setSources(result.value);
    return result;
  }, [session]);

  /** 저장본·초안을 다시 읽고 편집 칸을 그 값으로 바꾼다 */
  const reloadProfile = useCallback(async () => {
    const result = await loadProfileState(session);
    if (result.ok) {
      setState(result.value);
      setForm(formFrom(result.value));
    }
    return result;
  }, [session]);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    const [s, p] = await Promise.all([reloadSources(), reloadProfile()]);
    if (!s.ok) setLoadError(s.error);
    else if (!p.ok) setLoadError(p.error);
  }, [reloadSources, reloadProfile]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const kinds = useMemo(() => new Map((sources ?? []).map((s) => [s.name, s.kind] as const)), [sources]);

  async function addFiles(files: File[]) {
    setBusy(true);
    setLeftStatus(null);
    let problem: string | null = null;
    for (const file of files) {
      const kind = fileKind(file.name);
      if (!kind) {
        problem = unsupportedFileMessage(file.name);
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        problem = fileTooLargeMessage(file.name, MAX_FILE_MB);
        continue;
      }
      const added = await addFileSource(session, file, kind);
      if (!added.ok) problem = sourceAddErrorMessage(file.name, added.error);
    }
    await reloadSources();
    setBusy(false);
    if (problem) setLeftStatus({ ok: false, text: problem });
  }

  async function addText(title: string, text: string): Promise<boolean> {
    setBusy(true);
    setLeftStatus(null);
    const name = `붙여 넣은 텍스트 · ${title || formatDayTime(new Date().toISOString())}`;
    const added = await addTextSource(session, name, text);
    if (added.ok) await reloadSources();
    else setLeftStatus({ ok: false, text: sourceAddErrorMessage(name, added.error) });
    setBusy(false);
    return added.ok;
  }

  async function removeSource(source: ProfileSource) {
    setBusy(true);
    setLeftStatus(null);
    const removed = await deleteProfileSource(session, source);
    if (!removed.ok) setLeftStatus({ ok: false, text: sourceDeleteErrorMessage(removed.error) });
    await reloadSources();
    setBusy(false);
  }

  async function generate() {
    setBusy(true);
    setGenerating(true);
    setLeftStatus(null);
    setEditorStatus(null);
    const result = await generateProfile(session);
    if (!result.ok) {
      setLeftStatus({ ok: false, text: profileCallErrorMessage(result.error) });
    } else if (!result.value.ok) {
      setLeftStatus({ ok: false, text: profileGenerateFailMessage(result.value) });
    } else {
      const reloaded = await reloadProfile();
      setLeftStatus(
        reloaded.ok ? { ok: true, text: PROFILE_GENERATED } : { ok: false, text: profileLoadErrorMessage(reloaded.error) },
      );
    }
    setGenerating(false);
    setBusy(false);
    // 호출 기록이 늘었으니 사용액 줄을 다시 읽는다 (D26)
    void refresh();
  }

  async function save() {
    if (!form || !state || !sources) return;
    setBusy(true);
    setEditorStatus(null);
    const version = nextVersion(state.versions);
    const saved = await saveProfile(session, version, fromForm(form), sources.map((s) => s.name));
    if (saved.ok) {
      const reloaded = await reloadProfile();
      setEditorStatus(
        reloaded.ok
          ? { ok: true, text: `${SAVED_MESSAGE} (v${version})` }
          : { ok: false, text: profileLoadErrorMessage(reloaded.error) },
      );
      void refresh();
    } else {
      setEditorStatus({ ok: false, text: profileSaveErrorMessage(saved.error) });
    }
    setBusy(false);
  }

  async function discard() {
    setBusy(true);
    setEditorStatus(null);
    const discarded = await discardProfileDraft(session);
    if (discarded.ok) await reloadProfile();
    else setEditorStatus({ ok: false, text: draftDiscardErrorMessage(discarded.error) });
    setBusy(false);
  }

  if (!sources || !state || !form) {
    return (
      <div className="js-profile__state">
        {loadError ? profileLoadErrorMessage(loadError) : "프로필을 읽는 중…"}
        {loadError && (
          <button type="button" className="setup-btn" onClick={() => void loadAll()}>
            다시 시도
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="js-profile">
      <SourcePanel
        sources={sources}
        versions={state.versions}
        busy={busy}
        generating={generating}
        status={leftStatus}
        onAddFiles={(files) => void addFiles(files)}
        onAddText={addText}
        onDelete={(source) => void removeSource(source)}
        onGenerate={() => void generate()}
      />
      <ProfileEditor
        form={form}
        draft={state.draft}
        latest={state.latest}
        nextVersion={nextVersion(state.versions)}
        kinds={kinds}
        busy={busy}
        status={editorStatus}
        onChange={setForm}
        onSave={() => void save()}
        onDiscard={() => void discard()}
      />
    </div>
  );
}

export default ProfileTab;
