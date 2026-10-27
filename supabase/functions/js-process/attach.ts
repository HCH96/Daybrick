// js-process: 추출 요청에 붙일 공고 이미지 (R38, L28).
// 보통 이미지는 이미지 블록 그대로, 긴 이미지가 하나라도 있으면 JPEG·PNG를 모두 순서대로 나눈 PDF 한 개로 붙인다.
import { encodeBase64 } from "jsr:@std/encoding/base64";
import type { Caller } from "../_shared/auth.ts";
import {
  buildPdf,
  type ImageInfo,
  jpegToPdfImage,
  MAX_SIDE,
  needsSlicing,
  type PdfImage,
  pngToPdfImage,
  readImageInfo,
} from "./imagePdf.ts";

const BUCKET = "job-search";
/** 추출에 붙이는 이미지 합계 상한 (base64로 늘어나도 요청 크기 32MB 안) */
const MAX_IMAGE_TOTAL = 15 * 1024 * 1024;
/** PDF 쪽 수 상한 (Anthropic 한도 100쪽보다 적게) */
const MAX_PDF_PAGES = 60;
const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

export interface Attachments {
  blocks: Record<string, unknown>[];
  /** 이미지 블록 수 */
  images: number;
  /** 나눈 PDF의 쪽 수 (없으면 0) */
  pdfPages: number;
}

interface Item {
  path: string;
  type: string;
  bytes: Uint8Array;
  info: ImageInfo;
}

function imageBlock(item: Item): Record<string, unknown> {
  return { type: "image", source: { type: "base64", media_type: item.type, data: encodeBase64(item.bytes) } };
}

/** 이미지 블록으로 보내도 거절되지 않는지 (크기를 모르면 보낸다) */
function sendable(info: ImageInfo): boolean {
  return (info.width ?? 0) <= MAX_SIDE && (info.height ?? 0) <= MAX_SIDE;
}

async function toPdfImage(item: Item): Promise<PdfImage | null> {
  if (item.info.kind === "jpeg") return jpegToPdfImage(item.bytes, item.info);
  if (item.info.kind === "png") return await pngToPdfImage(item.bytes, item.info);
  return null;
}

/** 공고 이미지를 내려받아 추출 요청에 붙일 블록으로 만든다 */
export async function postingAttachments(caller: Caller, paths: string[]): Promise<Attachments> {
  const items: Item[] = [];
  let total = 0;
  for (const path of paths) {
    const type = IMAGE_TYPES[path.split(".").pop()?.toLowerCase() ?? ""];
    if (!type) continue;
    const file = await caller.admin.storage.from(BUCKET).download(path);
    if (file.error || !file.data) continue;
    const bytes = new Uint8Array(await file.data.arrayBuffer());
    if (total + bytes.byteLength > MAX_IMAGE_TOTAL) break;
    total += bytes.byteLength;
    items.push({ path, type, bytes, info: readImageInfo(bytes) });
  }

  if (!items.some((i) => needsSlicing(i.info))) {
    const ok = items.filter((i) => sendable(i.info));
    return { blocks: ok.map(imageBlock), images: ok.length, pdfPages: 0 };
  }

  const pdfImages: PdfImage[] = [];
  const rest: Item[] = [];
  for (const item of items) {
    const pdfImage = await toPdfImage(item);
    if (pdfImage) pdfImages.push(pdfImage);
    else if (!needsSlicing(item.info) && sendable(item.info)) rest.push(item);
    else console.error(`js-process 긴 이미지를 나누지 못해 뺌: ${item.path} (${item.info.kind} ${item.info.width}x${item.info.height})`);
  }
  const blocks: Record<string, unknown>[] = [];
  let pdfPages = 0;
  if (pdfImages.length > 0) {
    const built = buildPdf(pdfImages, MAX_PDF_PAGES);
    pdfPages = built.pages;
    blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: encodeBase64(built.pdf) } });
  }
  blocks.push(...rest.map(imageBlock));
  return { blocks, images: rest.length, pdfPages };
}
