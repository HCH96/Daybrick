// 문서(파일 또는 폴더)를 옮기면서 그것을 가리키는 링크·경로를 같이 고친다.
// 사용법 (프로젝트 루트에서):
//   node .claude/scripts/move-doc.mjs <원래 경로> <새 경로> [--dry-run]
//   예: node .claude/scripts/move-doc.mjs docs/desktop/features/plan/ai/plan docs/desktop/features/plan/archive/plan-initial
// 하는 일: git mv → 다른 문서의 링크와 글로 적힌 저장소 경로를 새 위치로 → 옮긴 파일 안의 상대 링크를 새 위치 기준으로 → 링크 검사
// 하지 않는 일: 색인의 설명 줄 정리(안내만 한다), 이름이 바뀔 때 파일 이름만 적은 언급 고치기(목록만 보여준다)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, abs, exists, listFiles, extractRefs, read } from "./doc-links.mjs";
import { check } from "./check-links.mjs";

const P = path.posix;
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const [fromArg, toArg] = args.filter((a) => !a.startsWith("--"));
const norm = (p) => P.normalize(p.replace(/\\/g, "/")).replace(/\/$/, "");

if (!fromArg || !toArg) {
  console.log("사용법: node .claude/scripts/move-doc.mjs <원래 경로> <새 경로> [--dry-run]");
  process.exit(2);
}
const from = norm(fromArg), to = norm(toArg);
if (!exists(from)) { console.error(`없는 경로: ${from}`); process.exit(2); }
if (exists(to)) { console.error(`이미 있는 경로: ${to} (덮어쓰지 않는다. 폴더 안으로 옮길 때는 새 이름까지 적는다)`); process.exit(2); }
if (to.startsWith(from + "/")) { console.error("자기 안으로는 옮길 수 없다."); process.exit(2); }

const moved = (p) => { const q = p.replace(/\/$/, ""); return q === from || q.startsWith(from + "/"); };
const mapPath = (p) => (moved(p) ? to + p.replace(/\/$/, "").slice(from.length) + (p.endsWith("/") ? "/" : "") : p);

// 1. 옮기기 전에 고칠 곳을 모두 계산한다
const edits = new Map(); // 새 파일 경로 → 새 내용
const changed = [];
for (const f of listFiles()) {
  const text = read(f);
  const newFile = mapPath(f);
  const reps = [];
  for (const r of extractRefs(f, text)) {
    if (!exists(r.target)) continue; // 이미 깨진 링크는 건드리지 않는다
    if (!moved(f) && !moved(r.target)) continue;
    const newTarget = mapPath(r.target);
    let raw;
    if (r.kind === "root") {
      if (!moved(r.target)) continue;
      raw = newTarget;
    } else {
      raw = P.relative(P.dirname(newFile), newTarget.replace(/\/$/, "")) || ".";
      if (r.raw.endsWith("/")) raw += "/";
    }
    if (raw !== r.raw) reps.push({ ...r, newRaw: raw });
  }
  if (!reps.length) continue;
  let out = text;
  for (const r of reps.sort((a, b) => b.start - a.start)) out = out.slice(0, r.start) + r.newRaw + out.slice(r.end);
  edits.set(newFile, out);
  changed.push({ file: f, newFile, reps });
}

console.log(`${dry ? "[미리보기] " : ""}${from} → ${to}`);
for (const c of changed) {
  console.log(`- ${c.file}${c.newFile !== c.file ? ` (→ ${c.newFile})` : ""}: ${c.reps.length}곳`);
  for (const r of c.reps.slice(0, 5)) console.log(`    ${r.raw} → ${r.newRaw}`);
  if (c.reps.length > 5) console.log(`    … ${c.reps.length - 5}곳 더`);
}
if (!changed.length) console.log("고칠 링크 없음.");

// 이름이 바뀌면 파일 이름만 적은 언급은 자동으로 못 고친다
const oldBase = P.basename(from), newBase = P.basename(to);
if (oldBase !== newBase) {
  // 이름만 적은 언급은 보통 같은 기능 폴더 안에 있다
  const scope = (from.match(/^docs\/[^/]+\/features\/[^/]+\//) || [P.dirname(from) + "/"])[0];
  const word = new RegExp(`(^|[^A-Za-z0-9_.-])${oldBase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_-])`);
  const hits = listFiles().filter((f) => f.startsWith(scope) && !moved(f) && word.test(read(f)));
  if (hits.length) {
    console.log(`\n이름이 바뀜(${oldBase} → ${newBase}). ${scope} 안에서 이름만 적은 언급이 있을 수 있는 파일 (직접 확인):`);
    for (const h of hits.slice(0, 15)) console.log("  " + h);
    if (hits.length > 15) console.log(`  … ${hits.length - 15}개 더`);
  }
}
// 가장 가까운 색인
const nearestIndex = (p) => {
  for (let d = P.dirname(p); d && d !== "."; d = P.dirname(d)) if (exists(`${d}/index.md`)) return `${d}/index.md`;
  return "DOCS_INDEX.md";
};
const idx = [...new Set([nearestIndex(from), nearestIndex(to)])];
console.log(`\n색인 확인: ${idx.join(", ")} 의 목록·설명 줄을 직접 정리한다 (링크 경로는 위에서 고쳤다).`);

if (dry) process.exit(0);

// 2. 옮기고 고친 내용을 쓴다
fs.mkdirSync(path.dirname(abs(to)), { recursive: true });
execFileSync("git", ["mv", from, to], { cwd: ROOT, stdio: "inherit" });
for (const [f, text] of edits) fs.writeFileSync(abs(f), text);

// 3. 검사
console.log("");
process.exit(check() ? 0 : 1);
