import { PAGE_LABELS } from "../../app/pageLabels";
import type { PageId } from "../../app/types";

function isPageId(source: string): source is PageId {
  return Object.prototype.hasOwnProperty.call(PAGE_LABELS, source);
}

/** 보낸 기능 이름: 페이지 목록에 있으면 그 이름, 없으면 "Daybrick" (R26) */
export function sourceLabel(source: string): string {
  return isPageId(source) ? PAGE_LABELS[source] : "Daybrick";
}
