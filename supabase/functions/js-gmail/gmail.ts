// js-gmail 공용: Gmail API 읽기 (job-search R64, R65, R69).
// 목록·머리글(제목·보낸 사람·받은 날)을 먼저 읽고, 지원 건과 맞는 메일만 본문을 받는다.
// 본문은 분류에만 쓰고 어디에도 저장하지 않는다.
import { decodeBase64 } from "jsr:@std/encoding/base64";

const API = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
/** 한 번에 머리글을 읽을 메일 수 상한 (최근 것부터) */
const MAX_LIST = 300;
/** 머리글을 동시에 읽는 수 */
const PARALLEL = 10;
/** 분류에 넣는 본문 길이 상한 */
const BODY_LIMIT = 6000;

export type GmailFail = "rejected" | "network" | "upstream";

export class GmailError extends Error {
  constructor(readonly reason: GmailFail) {
    super(reason);
  }
}

export interface MailHead {
  id: string;
  subject: string;
  /** 보낸 사람 표시 이름 (없으면 빈 글자) */
  senderName: string;
  /** 보낸 사람 주소 (소문자) */
  senderEmail: string;
  /** 받은 시각 ISO */
  receivedAt: string;
  /** 받은 시각 (밀리초) */
  receivedMs: number;
}

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Gmail API GET. 401·403(권한 취소·범위 없음)은 rejected (R70) */
async function get(token: string, url: string): Promise<Json> {
  let response: Response;
  try {
    response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new GmailError("network");
  }
  if (response.status === 401 || response.status === 403) {
    await response.body?.cancel();
    throw new GmailError("rejected");
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new GmailError("upstream");
  }
  const body: unknown = await response.json().catch(() => null);
  if (!isRecord(body)) throw new GmailError("upstream");
  return body;
}

/** 지정 시각 이후 받은 메일 id 목록 (최근 것부터, 상한 MAX_LIST) */
async function listIds(token: string, afterSec: number): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | null = null;
  do {
    const params = new URLSearchParams({ q: `after:${afterSec}`, maxResults: "100" });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await get(token, `${API}?${params}`);
    const messages = Array.isArray(page.messages) ? page.messages : [];
    for (const m of messages) if (isRecord(m) && typeof m.id === "string") ids.push(m.id);
    pageToken = typeof page.nextPageToken === "string" ? page.nextPageToken : null;
  } while (pageToken && ids.length < MAX_LIST);
  return ids.slice(0, MAX_LIST);
}

function header(payload: unknown, name: string): string {
  if (!isRecord(payload) || !Array.isArray(payload.headers)) return "";
  const found = payload.headers.find((h) => isRecord(h) && typeof h.name === "string" && h.name.toLowerCase() === name);
  return isRecord(found) && typeof found.value === "string" ? found.value : "";
}

/** `"넥슨 채용" <recruit@nexon.co.kr>` → 이름·주소 */
function parseFrom(from: string): { name: string; email: string } {
  const angle = from.match(/^(.*)<([^>]+)>\s*$/);
  if (angle) return { name: angle[1].trim().replace(/^"|"$/g, ""), email: angle[2].trim().toLowerCase() };
  return { name: "", email: from.trim().toLowerCase() };
}

async function readHead(token: string, id: string): Promise<MailHead | null> {
  const params = new URLSearchParams({ format: "metadata" });
  for (const h of ["Subject", "From"]) params.append("metadataHeaders", h);
  const message = await get(token, `${API}/${encodeURIComponent(id)}?${params}`);
  const receivedMs = Number(message.internalDate);
  if (!Number.isFinite(receivedMs)) return null;
  const from = parseFrom(header(message.payload, "from"));
  return {
    id,
    subject: header(message.payload, "subject").trim(),
    senderName: from.name,
    senderEmail: from.email,
    receivedAt: new Date(receivedMs).toISOString(),
    receivedMs,
  };
}

/** 지정 시각 이후 받은 메일의 머리글만 읽는다 (본문은 받지 않음, R65). 받은 순서(오래된 것부터)로 돌려준다 */
export async function listHeads(token: string, afterMs: number): Promise<MailHead[]> {
  const ids = await listIds(token, Math.floor(afterMs / 1000));
  const heads: MailHead[] = [];
  for (let i = 0; i < ids.length; i += PARALLEL) {
    const batch = await Promise.all(ids.slice(i, i + PARALLEL).map((id) => readHead(token, id)));
    for (const head of batch) if (head && head.receivedMs > afterMs) heads.push(head);
  }
  return heads.sort((a, b) => a.receivedMs - b.receivedMs);
}

function decodePart(data: unknown): string {
  if (typeof data !== "string" || data === "") return "";
  try {
    const base64 = data.replaceAll("-", "+").replaceAll("_", "/");
    return new TextDecoder().decode(decodeBase64(base64 + "=".repeat((4 - (base64.length % 4)) % 4)));
  } catch {
    return "";
  }
}

/** 메일 부분들에서 text/plain을 먼저, 없으면 text/html을 모은다 */
function collect(part: unknown, out: { plain: string[]; html: string[] }): void {
  if (!isRecord(part)) return;
  const mime = typeof part.mimeType === "string" ? part.mimeType : "";
  const data = isRecord(part.body) ? part.body.data : undefined;
  if (mime === "text/plain") out.plain.push(decodePart(data));
  else if (mime === "text/html") out.html.push(decodePart(data));
  if (Array.isArray(part.parts)) for (const child of part.parts) collect(child, out);
}

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** 보이지 않는 문자(폭 없는 문자·방향 제어·태그 문자 등)를 지운다 (ai-rules.md "원문 취급") */
function stripInvisible(text: string): string {
  return text.replace(/[​-‏‪-‮⁠-⁤⁦-⁩­﻿]|[\u{E0000}-\u{E007F}]/gu, "");
}

/** 메일 본문 글자 (분류에만 쓰고 저장하지 않는다) */
export async function readBody(token: string, id: string): Promise<string> {
  const message = await get(token, `${API}/${encodeURIComponent(id)}?format=full`);
  const out = { plain: [] as string[], html: [] as string[] };
  collect(message.payload, out);
  const raw = out.plain.join("\n").trim() || htmlToText(out.html.join("\n"));
  const text = stripInvisible(raw).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
  return text.slice(0, BODY_LIMIT);
}
