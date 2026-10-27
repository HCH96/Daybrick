import { useRef, useState, type DragEvent } from "react";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import type { ProfileVersionInfo } from "../../../features/job-search/api";
import { EMPTY_PASTE, NO_SOURCES_HINT } from "../../../features/job-search/messages";
import type { ProfileSource } from "../../../features/job-search/types";
import { SparkIcon } from "../settings/SettingsIcons";
import { FileIcon, TextIcon, UploadIcon } from "./ProfileIcons";
import { formatDay, formatDayTime, formatSize, type StatusLine } from "./profileFormat";

const KIND_LABEL: Record<ProfileSource["kind"], string> = { pdf: "PDF", md: "MD", text: "TXT" };

/** 자료 줄 아래 작은 글씨: 크기(붙여 넣은 텍스트는 글자 수) · 넣은 날 */
function sourceSub(source: ProfileSource): string {
  const added = `${formatDay(source.createdAt)} 추가`;
  if (source.kind === "text") return `${(source.text ?? "").length.toLocaleString()}자 · ${added}`;
  return source.sizeBytes !== null ? `${formatSize(source.sizeBytes)} · ${added}` : added;
}

interface SourcePanelProps {
  sources: ProfileSource[];
  versions: ProfileVersionInfo[];
  busy: boolean;
  generating: boolean;
  status: StatusLine;
  onAddFiles: (files: File[]) => void;
  onAddText: (title: string, text: string) => Promise<boolean>;
  onDelete: (source: ProfileSource) => void;
  onGenerate: () => void;
}

/** 왼쪽 판: 자료 목록·넣기(R17), 프로필 만들기(R18), 저장된 버전 목록(R21) */
function SourcePanel({
  sources,
  versions,
  busy,
  generating,
  status,
  onAddFiles,
  onAddText,
  onDelete,
  onGenerate,
}: SourcePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);

  function onDragOver(e: DragEvent) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setDragOver(true);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && !busy) onAddFiles(files);
  }

  async function addText() {
    if (text.trim() === "") return setPasteError(EMPTY_PASTE);
    if (await onAddText(title.trim(), text)) {
      setPasting(false);
      setTitle("");
      setText("");
      setPasteError(null);
    }
  }

  const latest = versions[0] ?? null;

  return (
    <section className="js-profile__panel js-profile__sources">
      <h3 className="js-profile__title">
        <FileIcon />
        자료
      </h3>
      <p className="js-profile__desc">PDF, 마크다운 파일, 붙여 넣은 텍스트를 여러 개 넣을 수 있어요.</p>

      {sources.length > 0 && (
        <div className="js-profile__src-list">
          {sources.map((source) => (
            <div key={source.id} className="js-profile__src">
              <span className={`js-profile__src-ico js-profile__src-ico--${source.kind}`}>{KIND_LABEL[source.kind]}</span>
              <div className="js-profile__src-main">
                <b title={source.name}>{source.name}</b>
                <span className="js-profile__sub">{sourceSub(source)}</span>
              </div>
              <button
                type="button"
                className="js-profile__icon-btn"
                aria-label={`${source.name} 지우기`}
                disabled={busy}
                onClick={() => onDelete(source)}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {pasting ? (
        <div className="js-profile__paste">
          <input
            className="js-profile__input"
            value={title}
            placeholder="제목 (예: 자기소개서 초안)"
            aria-label="붙여 넣은 텍스트 제목"
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="js-profile__input js-profile__input--area js-profile__input--paste"
            value={text}
            placeholder="여기에 붙여 넣기"
            aria-label="붙여 넣을 텍스트"
            autoFocus
            onChange={(e) => setText(e.target.value)}
          />
          {pasteError && <span className="js-profile__msg--bad">{pasteError}</span>}
          <div className="js-profile__btn-row">
            <button type="button" className="setup-btn setup-btn--ghost" onClick={() => setPasting(false)}>
              취소
            </button>
            <button type="button" className="setup-btn" disabled={busy} onClick={() => void addText()}>
              넣기
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`js-profile__drop${dragOver ? " js-profile__drop--over" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <UploadIcon />
          <div>파일을 여기로 끌어 놓기</div>
          <div className="js-profile__btn-row">
            <button type="button" className="setup-btn" disabled={busy} onClick={() => fileRef.current?.click()}>
              <PlusIcon size={13} />
              파일 추가
            </button>
            <button type="button" className="setup-btn" disabled={busy} onClick={() => setPasting(true)}>
              <TextIcon />
              텍스트 붙여 넣기
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            hidden
            multiple
            accept=".pdf,.md,.markdown,application/pdf,text/markdown"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length > 0) onAddFiles(files);
            }}
          />
        </div>
      )}

      <button
        type="button"
        className="setup-btn setup-btn--primary js-profile__make"
        disabled={busy || sources.length === 0}
        onClick={onGenerate}
      >
        <SparkIcon />
        {generating ? "프로필 만드는 중…" : latest ? "프로필 다시 만들기" : "프로필 만들기"}
      </button>
      <div className="js-profile__make-note">
        {sources.length === 0
          ? NO_SOURCES_HINT
          : generating
            ? "자료를 분석하고 있어요. 1~2분 걸릴 수 있어요."
            : `서버에서 Opus 5.5가 자료 ${sources.length}개를 분석해요`}
      </div>
      {status && (
        <div className={`js-profile__status js-profile__msg--${status.ok ? "ok" : "bad"}`} role="status">
          {status.text}
        </div>
      )}

      {latest && (
        <div className="js-profile__saved">
          <b>저장된 프로필 v{latest.version}</b>
          <span className="js-profile__sub">{formatDay(latest.savedAt)} 저장 · 지금 채점에 쓰이는 프로필</span>
          {versions.length > 1 && (
            <ul className="js-profile__versions">
              {versions.slice(1).map((v) => (
                <li key={v.version}>
                  v{v.version} <span className="js-profile__sub">{formatDayTime(v.savedAt)} 저장</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default SourcePanel;
