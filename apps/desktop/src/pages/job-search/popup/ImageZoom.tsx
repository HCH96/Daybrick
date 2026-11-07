import { useRef, useState, type MouseEvent, type WheelEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../components/icons/CommonIcons";
import { CloseIcon } from "../../../components/icons/DialogIcons";
import { useOverlayRoot } from "../../../components/layout/overlayRoot";
import { useDialogFocus } from "../../../components/common/useDialogFocus";
import { useEscapeLayer } from "../../../components/common/useEscapeLayer";
import "./ImageZoom.css";

interface ImageZoomProps {
  urls: string[];
  start: number;
  /** 위쪽 이름 줄 (회사 · 제목) */
  title: string;
  onClose: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const STEP = 0.25;

function clamp(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(scale / STEP) * STEP));
}

/** 이미지 크게 보기 (R11): 창 전체를 어둡게 덮고, −/+·휠로 확대, 여러 장이면 좌우, X·Esc·바깥 누르기로 닫기 */
function ImageZoom({ urls, start, title, onClose }: ImageZoomProps) {
  const root = useOverlayRoot();
  const boxRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);
  const [scale, setScale] = useState(1);

  useEscapeLayer(onClose);
  useDialogFocus(boxRef);

  const go = (next: number) => {
    setIndex((next + urls.length) % urls.length);
    setScale(1);
  };
  const onWheel = (e: WheelEvent<HTMLDivElement>) => setScale((s) => clamp(s + (e.deltaY < 0 ? STEP : -STEP)));
  const onBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!root) return null;
  return createPortal(
    <div
      ref={boxRef}
      className="js-zoom"
      role="dialog"
      aria-modal="true"
      aria-label="공고 이미지 크게 보기"
      tabIndex={-1}
      onClick={onBackdrop}
    >
      <div className="js-zoom__top">
        <span className="js-zoom__name">
          {title} · 이미지 {index + 1}/{urls.length}
        </span>
        {urls.length > 1 && (
          <>
            <button type="button" className="js-zoom__btn" aria-label="이전 이미지" onClick={() => go(index - 1)}>
              <ChevronLeftIcon size={16} />
            </button>
            <button type="button" className="js-zoom__btn" aria-label="다음 이미지" onClick={() => go(index + 1)}>
              <ChevronRightIcon size={16} />
            </button>
          </>
        )}
        <button
          type="button"
          className="js-zoom__btn"
          aria-label="축소"
          disabled={scale <= MIN_SCALE}
          onClick={() => setScale((s) => clamp(s - STEP))}
        >
          −
        </button>
        <span className="js-zoom__pct">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="js-zoom__btn"
          aria-label="확대"
          disabled={scale >= MAX_SCALE}
          onClick={() => setScale((s) => clamp(s + STEP))}
        >
          +
        </button>
        <button type="button" className="js-zoom__x" aria-label="닫기" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="js-zoom__stage" onWheel={onWheel} onClick={onBackdrop}>
        <img
          className="js-zoom__img"
          src={urls[index]}
          alt={`공고 이미지 ${index + 1}`}
          style={{ width: `${640 * scale}px` }}
          draggable={false}
        />
      </div>
    </div>,
    root,
  );
}

export default ImageZoom;
