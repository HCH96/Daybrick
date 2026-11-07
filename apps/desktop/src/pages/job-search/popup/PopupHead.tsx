import type { ReactNode } from "react";
import { ExternalLinkIcon } from "../../../components/icons/CommonIcons";
import { CloseIcon } from "../../../components/icons/DialogIcons";
import { ddayLabel } from "../../../features/job-search/dday";
import type { PostingDetail } from "../../../features/job-search/postingApi";
import { monthDay, shortDay } from "../../../features/job-search/postingFormat";
import { openExternal } from "../../server-setup/wizard/openExternal";
import { ImageIcon } from "./PopupIcons";

interface PopupHeadProps {
  detail: PostingDetail;
  /** 마감까지 남은 날 (상시 null) */
  days: number | null;
  onClose: () => void;
  /** 제목 아래(경력·형태 칩 줄 위) 출처 칩 줄 (R92) */
  sources?: ReactNode;
}

/** 마감 칩 글자·색: `D-12 · 11/08 마감`(파랑), D-5 이하 빨강, 지났으면 "마감 지남", 없으면 "상시" */
function deadlineChip(date: string | null, days: number | null): { text: string; tone: string } {
  if (!date || days === null) return { text: "상시", tone: "" };
  if (days < 0) return { text: `${monthDay(date)} 마감 지남`, tone: "" };
  const label = ddayLabel(days);
  return { text: `${label.text} · ${monthDay(date)} 마감`, tone: label.kind === "soon" ? "red" : "blue" };
}

/** 팝업 머리 (R10): 회사·사이트·수집일 / 제목 / 출처 칩 줄 / 경력·형태·근무지·마감 칩, 오른쪽 [원문 보기]·X */
function PopupHead({ detail, days, onClose, sources }: PopupHeadProps) {
  const f = detail.fields;
  const chips = [f?.experience.text ?? null, f?.employment.join(", ") || null, f?.location ?? null].filter(
    (c): c is string => c !== null,
  );
  const deadline = deadlineChip(f?.deadline.date ?? null, days);
  const url = detail.url;
  return (
    <div className="js-popup__head">
      <div className="js-popup__head-main">
        <div className="js-popup__co">
          <b>{detail.company ?? "회사 없음"}</b>
          {detail.siteName && <span>· {detail.siteName}</span>}
          <span>· {shortDay(detail.collectedAt)} 수집</span>
        </div>
        <h2 className="js-popup__title">{detail.title ?? "제목 없음"}</h2>
        {sources}
        <div className="js-popup__chips">
          {chips.map((c) => (
            <span key={c} className="js-popup__chip">
              {c}
            </span>
          ))}
          <span className={`js-popup__chip${deadline.tone ? ` js-popup__chip--${deadline.tone}` : ""}`}>{deadline.text}</span>
          {detail.imagePaths.length > 0 && (
            <span className="js-popup__chip">
              <ImageIcon />
              이미지 공고
            </span>
          )}
        </div>
      </div>
      <div className="js-popup__head-side">
        <button type="button" className="setup-btn" disabled={!url} onClick={() => url && openExternal(url)}>
          <ExternalLinkIcon size={12} />
          원문 보기
        </button>
        <button type="button" className="js-popup__x" aria-label="닫기" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

export default PopupHead;
