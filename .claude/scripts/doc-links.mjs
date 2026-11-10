// 문서 링크 공용 모듈: check-links.mjs와 move-doc.mjs가 같이 쓴다.
// 경로는 모두 저장소 기준 posix 문자열(예: "docs/desktop/index.md")로 다룬다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const P = path.posix;

// 지난 토큰 보고서는 당시 기록이라 검사·치환하지 않는다 (목차 index.md만 본다).
const SKIP = [/^docs\/common\/ai\/token-reports\/(?!index\.md$)/, /(^|\/)node_modules\//, /^\.claude\/worktrees\//];
const DOC_EXT = /\.(md|html)$/;
const CODE_EXT = /\.(ts|tsx|css|rs|kt)$/; // 앱 코드는 주석의 저장소 경로만 본다

export const abs = (p) => path.join(ROOT, ...p.split("/"));
export const exists = (p) => fs.existsSync(abs(p.replace(/\/$/, "") || "."));

function walk(dir, out) {
  if (!fs.existsSync(abs(dir))) return out;
  for (const e of fs.readdirSync(abs(dir), { withFileTypes: true })) {
    const p = dir ? `${dir}/${e.name}` : e.name;
    if (SKIP.some((r) => r.test(p + (e.isDirectory() ? "/" : "")))) continue;
    if (e.isDirectory()) {
      if (["node_modules", "dist", "target", ".git"].includes(e.name)) continue;
      walk(p, out);
    } else out.push(p);
  }
  return out;
}

// 검사 대상 파일: docs/, .claude/, 최상위 md, 앱 소스(src)
export function listFiles() {
  const top = fs.readdirSync(ROOT).filter((n) => n.endsWith(".md"));
  const docs = [...walk("docs", []), ...walk(".claude", [])].filter((f) => DOC_EXT.test(f));
  const apps = fs.existsSync(abs("apps"))
    ? fs.readdirSync(abs("apps")).flatMap((a) => walk(`apps/${a}/src`, [])).filter((f) => CODE_EXT.test(f))
    : [];
  return [...top, ...docs, ...apps];
}

// 링크로 볼 만한 모양인지: 공백·자리표시 없음, 확장자가 있거나 /로 끝남
function pathLike(t) {
  if (!t || /[\s<>{}$*`]/.test(t) || /^[a-z]+:/i.test(t) || t.startsWith("#")) return false;
  return /\.[A-Za-z0-9]+$/.test(t) || t.endsWith("/");
}

// 파일 안의 참조 목록. kind: "rel"(파일 기준 상대 링크) | "root"(글로 적힌 저장소 기준 경로)
export function extractRefs(file, text) {
  const refs = [];
  const taken = [];
  const isDoc = DOC_EXT.test(file);
  // 마크다운 코드 블록(```)은 양식 예시라 보지 않는다
  const fences = [];
  if (file.endsWith(".md")) {
    for (const m of text.matchAll(/^```[^\n]*\n[\s\S]*?^```/gm)) fences.push([m.index, m.index + m[0].length]);
  }
  // 기록·AI 테스트 보고서·보관 문서에 글로 적힌 경로는 당시 기록이라 보지 않는다 (링크는 본다)
  const history = /\/(logs|archive)\/|\/ai\/tests\//.test(file);
  const add = (kind, raw, start) => {
    const clean = raw.replace(/[?#].*$/, "");
    if (!pathLike(clean)) return;
    if (fences.some(([a, b]) => start >= a && start < b)) return;
    if (kind === "root" && history) return;
    const target = kind === "root" ? P.normalize(clean.replace(/^\//, "")) : P.normalize(P.join(P.dirname(file), clean));
    if (target.startsWith("..")) return;
    refs.push({ kind, raw: clean, start, end: start + clean.length, target: clean.endsWith("/") && !target.endsWith("/") ? target + "/" : target });
    taken.push([start, start + clean.length]);
  };
  if (isDoc) {
    for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) add("rel", m[1], m.index + 2);
    for (const m of text.matchAll(/(?:href|src)="([^"]+)"/g)) add("rel", m[1], m.index + m[0].indexOf('"') + 1);
  }
  for (const m of text.matchAll(/(?<![A-Za-z0-9_./-])((?:docs|\.claude)\/[A-Za-z0-9_./-]*)/g)) {
    const raw = m[1].replace(/\.+$/, "");
    const s = m.index;
    if (taken.some(([a, b]) => s < b && s + raw.length > a)) continue;
    add("root", raw, s);
  }
  return refs;
}

export const read = (f) => fs.readFileSync(abs(f), "utf8");

// 깨진 참조 목록. 각 항목: "파일 → 원문"
export function findBroken() {
  const broken = [];
  for (const f of listFiles()) {
    for (const r of extractRefs(f, read(f))) if (!exists(r.target)) broken.push(`${f} → ${r.raw}`);
  }
  return broken;
}

export const BASELINE = ".claude/scripts/link-baseline.txt";
export function readBaseline() {
  if (!exists(BASELINE)) return [];
  return read(BASELINE).split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
}
