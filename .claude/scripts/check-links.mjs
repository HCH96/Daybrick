// 문서 링크 검사. 기준 목록(link-baseline.txt)에 없는 깨진 링크가 있으면 실패(종료 코드 1).
// 사용법 (프로젝트 루트에서):
//   node .claude/scripts/check-links.mjs                 새로 깨진 링크만 보기
//   node .claude/scripts/check-links.mjs --all           깨진 링크 전부 보기
//   node .claude/scripts/check-links.mjs --update-baseline  지금 깨진 링크로 기준 목록 다시 쓰기
import fs from "node:fs";
import { findBroken, readBaseline, BASELINE, abs } from "./doc-links.mjs";

export function check({ quiet = false } = {}) {
  const broken = findBroken();
  const base = new Set(readBaseline());
  const fresh = broken.filter((b) => !base.has(b));
  const fixed = [...base].filter((b) => !broken.includes(b));
  if (!quiet || fresh.length) {
    if (fresh.length) {
      console.log(`새로 깨진 링크 ${fresh.length}개:`);
      for (const b of fresh) console.log("  " + b);
      console.log("고치는 법: 옮긴 파일이면 move-doc.mjs로 옮기고, 아니면 링크를 직접 고친다.");
    } else console.log(`링크 검사 통과 (기준 목록의 알려진 깨진 링크 ${broken.length}개 제외).`);
    if (fixed.length) console.log(`기준 목록에서 고쳐진 항목 ${fixed.length}개: --update-baseline으로 목록을 줄일 수 있다.`);
  }
  return fresh.length === 0;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--update-baseline")) {
    const broken = findBroken();
    const head = "# 알려진 깨진 링크 (파일 → 링크). check-links.mjs가 이 목록에 없는 것만 실패로 본다.\n# 고치면 줄을 지운다. 새로 깨진 링크를 여기 넣어 덮지 않는다.\n";
    fs.writeFileSync(abs(BASELINE), head + broken.join("\n") + (broken.length ? "\n" : ""));
    console.log(`기준 목록을 ${broken.length}개로 다시 썼다.`);
  } else if (args.includes("--all")) {
    const broken = findBroken();
    for (const b of broken) console.log(b);
    console.log(`깨진 링크 ${broken.length}개`);
  } else process.exit(check() ? 0 : 1);
}
