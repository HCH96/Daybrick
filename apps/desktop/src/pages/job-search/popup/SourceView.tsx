import { IMAGE_LOAD_ERROR, NO_BODY_YET, REP_BODY_PENDING } from "../../../features/job-search/messages";
import { ImageIcon, TextIcon, ZoomIcon } from "./PopupIcons";

interface SourceViewProps {
  bodyText: string | null;
  /** 저장된 이미지가 있는 공고인가 (주소를 읽기 전에도 이미지 칸을 그린다) */
  hasImages: boolean;
  /** 서명 주소. 읽는 중 null */
  imageUrls: string[] | null;
  imageError: boolean;
  onZoom: (index: number) => void;
  /** 묶음 대표인가. 대표가 바뀐 직후엔 원문이 아직 없다 (R87) */
  bundled?: boolean;
}

/** 공고 원문 (R10, R11): 이미지 공고는 300px 이미지와 "크게 보기", 아니면 텍스트 */
function SourceView({ bodyText, hasImages, imageUrls, imageError, onZoom, bundled = false }: SourceViewProps) {
  const text = bodyText?.trim() ?? "";
  if (hasImages) {
    return (
      <section>
        <h3 className="js-popup__sec-title">
          <ImageIcon />
          공고 원문 (이미지{imageUrls && imageUrls.length > 1 ? ` ${imageUrls.length}장` : ""})
        </h3>
        {imageError ? (
          <p className="js-popup__empty">{IMAGE_LOAD_ERROR}</p>
        ) : !imageUrls ? (
          <p className="js-popup__empty">이미지를 읽는 중…</p>
        ) : (
          <div className="js-popup__posters">
            {imageUrls.map((url, i) => (
              <button key={url} type="button" className="js-popup__poster" onClick={() => onZoom(i)}>
                <img src={url} alt={`공고 이미지 ${i + 1}`} />
                <span className="js-popup__zoom-hint">
                  <ZoomIcon />
                  크게 보기
                </span>
              </button>
            ))}
          </div>
        )}
        {text && <div className="js-popup__source-text">{text}</div>}
      </section>
    );
  }
  return (
    <section>
      <h3 className="js-popup__sec-title">
        <TextIcon />
        공고 원문
      </h3>
      {bodyText === null ? (
        <p className="js-popup__empty">{bundled ? REP_BODY_PENDING : NO_BODY_YET}</p>
      ) : (
        <div className="js-popup__source-text">{text || "—"}</div>
      )}
    </section>
  );
}

export default SourceView;
