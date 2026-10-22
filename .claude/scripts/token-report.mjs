#!/usr/bin/env node
// Claude Code 대화 기록(JSONL)을 읽어 토큰 사용량과 컨텍스트가 커진 원인을 마크다운 보고서로 만든다.
// 사용: node .claude/scripts/token-report.mjs [세션ID] [--out 보고서.md] [--title 제목]
//   세션ID를 생략하면 이 프로젝트의 가장 최근 세션을 쓴다.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ---------- 인자 ----------
const args = process.argv.slice(2);
const opt = { out: null, title: null, session: null };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') opt.out = args[++i];
  else if (args[i] === '--title') opt.title = args[++i];
  else opt.session = args[i];
}

const projectDir = path.join(
  os.homedir(), '.claude', 'projects',
  process.cwd().replace(/[^A-Za-z0-9]/g, '-'),
);
if (!fs.existsSync(projectDir)) fail(`대화 기록 폴더가 없습니다: ${projectDir}`);

if (!opt.session) {
  const latest = fs.readdirSync(projectDir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => ({ f, t: fs.statSync(path.join(projectDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0];
  if (!latest) fail('세션 기록이 없습니다.');
  opt.session = latest.f.replace(/\.jsonl$/, '');
}
const mainFile = path.join(projectDir, `${opt.session}.jsonl`);
if (!fs.existsSync(mainFile)) fail(`세션 파일이 없습니다: ${mainFile}`);

// ---------- 읽기 ----------
function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).flatMap((l) => {
    try { return [JSON.parse(l)]; } catch { return []; }
  });
}

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const rel = (p) => {
  const s = String(p ?? '').replace(/\\/g, '/');
  const cwd = process.cwd().replace(/\\/g, '/');
  return s.toLowerCase().startsWith(cwd.toLowerCase() + '/') ? s.slice(cwd.length + 1) : s;
};
const short = (s, n = 60) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};
const sizeOf = (v) => (typeof v === 'string' ? v.length : JSON.stringify(v ?? '').length);

// 대화 기록에만 남고 모델에게는 보내지 않는 항목. 증가분 분배에서 뺀다.
const LOG_ONLY = new Set(['prompt_snapshot']);

// 문서로 볼 경로: docs/, .claude/, 마크다운·HTML, 목업
const DOC_RE = /(^|[\s"'/=])(docs\/|\.claude\/)|\.md\b|\.html\b|mockups|DOCS_INDEX|PROJECT\.md/;
const docOrCode = (s) => (DOC_RE.test(String(s ?? '').replace(/\\/g, '/')) ? '문서' : '코드');

// 도구 호출 하나의 종류(kind), 분류(cat), 대상
function describeTool(name, input = {}) {
  switch (name) {
    case 'Read': return { kind: 'Read', cat: docOrCode(input.file_path), target: rel(input.file_path) };
    case 'Edit': case 'Write': case 'NotebookEdit': return { kind: name, cat: '편집', target: rel(input.file_path ?? input.notebook_path) };
    case 'Grep': return { kind: 'Grep', cat: docOrCode(input.path), target: `${input.pattern}${input.path ? ' @ ' + rel(input.path) : ''}` };
    case 'Glob': return { kind: 'Glob', cat: docOrCode(`${input.path ?? ''} ${input.pattern}`), target: input.pattern };
    case 'Agent': case 'Task': return { kind: 'Agent', cat: '하위 에이전트 보고', target: input.description };
    case 'Bash': case 'PowerShell': {
      const full = String(input.command ?? '');
      // 앞의 `cd "경로" &&` 같은 준비 부분은 빼고 실제 명령만 보여 준다 (분류는 cd 경로까지 보고 정한다)
      const c = full.replace(/^(\s*(cd\s+("[^"]*"|\S+)|[A-Za-z_$][\w:]*=("[^"]*"|\S+))\s*(&&|;)\s*)+/, '');
      const build = /npm run build|tsc|cargo (check|build)|tauri build/.test(c);
      const git = /^\s*git\b/.test(c);
      const kind = build ? 'Bash: 빌드·타입검사' : git ? 'Bash: git' : 'Bash: 기타';
      // sed -i, 리디렉션(>, >>), python 히어독은 읽기가 아니라 파일 고치기로 본다
      const edit = /\bsed\s+-i|(^|[^0-9&>])>>?\s*(?!&|\/dev\/null)\S|\bpython3?\s+-\s*<</.test(c);
      const cat = build ? '빌드·검사' : git ? 'git' : edit ? '편집' : docOrCode(full);
      return { kind, cat, target: short(c, 70) };
    }
    default: {
      const cat = /^mcp__(Claude_Browser|claude-in-chrome)__/.test(name) ? '브라우저' : '기타 도구';
      return { kind: name, cat, target: short(JSON.stringify(input), 50) };
    }
  }
}

// 첫 호출 입력(시작 ctx)을 이루는 항목. 기록에 남은 글자 수로 나눈다.
const START_PARTS = {
  skill_listing: '스킬 목록', deferred_tools_delta: '나중에 불러올 도구 이름 목록',
  agent_listing_delta: '에이전트·MCP 안내', mcp_instructions_delta: '에이전트·MCP 안내',
  instructions: 'CLAUDE.md·메모리 (instructions)',
};

// 한 기록 파일을 API 호출 단위로 분석한다.
// 호출 n의 컨텍스트 = input + cache_creation + cache_read.
// 호출 n → n+1 사이 증가분 = ctx(n+1) - ctx(n). 그중 output(n)은 "모델 응답", 나머지는 그 사이 들어온 항목에 글자 수 비율로 나눈다.
function analyze(entries, label) {
  const calls = []; // { id, usage, items: [] (이 호출 뒤에 들어온 항목) }
  const toolInfo = new Map(); // tool_use_id -> {kind,target}
  const agentCalls = []; // 메인에서 띄운 Agent: { toolUseId, prompt, description }
  let pending = []; // 첫 호출 전에 들어온 항목
  let compactions = 0;
  let snapshot = null; // 도구 정의가 담긴 첫 prompt_snapshot (시작 ctx 구성 계산용)
  const seen = new Set();

  for (const o of entries) {
    if (o.type === 'system' && o.subtype === 'compact_boundary') { compactions++; continue; }
    if (o.type === 'attachment' && LOG_ONLY.has(o.attachment?.type)) {
      if (!snapshot && Array.isArray(o.attachment.tools)) snapshot = o.attachment;
      continue;
    }
    if (o.type === 'assistant' && o.message?.usage) {
      const id = o.message.id ?? o.uuid;
      for (const c of o.message.content ?? []) {
        if (c.type === 'tool_use') {
          toolInfo.set(c.id, describeTool(c.name, c.input));
          if (c.name === 'Agent' || c.name === 'Task') agentCalls.push({ toolUseId: c.id, prompt: c.input?.prompt ?? '', description: c.input?.description ?? '' });
        }
      }
      if (seen.has(id)) continue; // 같은 응답이 여러 줄로 나뉘어 기록됨
      seen.add(id);
      const u = o.message.usage;
      calls.push({
        ctx: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
        fresh: u.input_tokens ?? 0, write: u.cache_creation_input_tokens ?? 0, read: u.cache_read_input_tokens ?? 0,
        out: u.output_tokens ?? 0, think: u.output_tokens_details?.thinking_tokens ?? 0,
        items: [], before: pending,
      });
      pending = [];
      continue;
    }
    const sink = calls.length ? calls[calls.length - 1].items : pending;
    if (o.type === 'user' && o.message) {
      const content = o.message.content;
      if (typeof content === 'string') { sink.push({ kind: '사용자·지시 입력', cat: '지시', target: short(content, 50), chars: content.length }); continue; }
      for (const c of content ?? []) {
        if (c.type === 'tool_result') {
          const info = toolInfo.get(c.tool_use_id) ?? { kind: '도구 결과', cat: '기타 도구', target: '' };
          sink.push({ ...info, chars: sizeOf(c.content) });
        } else if (c.type === 'text') {
          sink.push({ kind: '사용자·지시 입력', cat: '지시', target: short(c.text, 50), chars: c.text.length });
        }
      }
    } else if (o.type === 'attachment' && o.attachment) {
      sink.push({ kind: `알림: ${o.attachment.type}`, cat: '알림', type: o.attachment.type, target: '', chars: sizeOf(o.attachment) });
    }
  }

  // 증가분 배정
  const added = []; // { kind, target, tokens, laterCalls, label }
  for (let n = 0; n < calls.length - 1; n++) {
    const growth = calls[n + 1].ctx - calls[n].ctx;
    const laterCalls = calls.length - (n + 1);
    const outPart = Math.min(Math.max(growth, 0), calls[n].out);
    if (outPart > 0) added.push({ kind: '모델 응답(출력)', cat: '모델 출력', target: '', tokens: outPart, laterCalls, label });
    const rest = growth - outPart;
    const items = calls[n].items;
    const totalChars = items.reduce((s, it) => s + it.chars, 0);
    if (rest > 0 && totalChars > 0) {
      for (const it of items) added.push({ kind: it.kind, cat: it.cat, target: it.target, tokens: rest * (it.chars / totalChars), laterCalls, label });
    } else if (rest > 0) {
      added.push({ kind: '분배 불가(설명 없는 증가)', cat: '기타 도구', target: '', tokens: rest, laterCalls, label });
    }
  }

  const sum = (k) => calls.reduce((s, c) => s + c[k], 0);
  return {
    label, calls, added, agentCalls, compactions,
    startParts: startComposition(calls[0], snapshot),
    start: calls[0]?.ctx ?? 0,
    peak: Math.max(0, ...calls.map((c) => c.ctx)),
    end: calls[calls.length - 1]?.ctx ?? 0,
    fresh: sum('fresh'), write: sum('write'), read: sum('read'), out: sum('out'), think: sum('think'),
  };
}

// 시작 ctx(첫 호출 입력)를 구성 항목별로 나눈다.
// prompt_snapshot에 도구 정의가 있으면 모든 항목을 글자 수 비율로 나누고,
// 없으면 아는 항목만 글자 수 ÷ 4로 어림하고 나머지를 "기록에 없음"으로 둔다.
function startComposition(first, snap) {
  if (!first) return null;
  const parts = new Map();
  const add = (label, chars) => parts.set(label, (parts.get(label) ?? 0) + chars);
  if (snap) {
    add('도구 정의', sizeOf(snap.tools));
    add('시스템 프롬프트', sizeOf(snap.systemPrompt));
  }
  for (const it of first.before) add(it.cat === '알림' ? (START_PARTS[it.type] ?? '기타 알림') : '지시문 (사용자·명령)', it.chars);
  const totalChars = [...parts.values()].reduce((s, c) => s + c, 0);
  const toTok = (chars) => (snap ? first.ctx * (chars / totalChars) : chars / 4);
  const rows = [...parts].map(([label, chars]) => ({ label, tokens: toTok(chars) }));
  if (!snap) rows.push({ label: '기록에 없음 (시스템 프롬프트·도구 정의 추정)', tokens: Math.max(0, first.ctx - rows.reduce((s, r) => s + r.tokens, 0)) });
  const bigTools = snap
    ? snap.tools.map((t) => ({ name: t.name, tokens: toTok(sizeOf(t)) })).sort((a, b) => b.tokens - a.tokens).slice(0, 4)
    : [];
  return { rows, bigTools, toolCount: snap?.tools.length ?? 0 };
}

// ---------- 메인 + 하위 에이전트 ----------
const mainEntries = readJsonl(mainFile).filter((o) => !o.isSidechain);
const main = analyze(mainEntries, '메인');
const subDir = path.join(projectDir, opt.session, 'subagents');
const segments = [main];
if (fs.existsSync(subDir)) {
  const byTool = new Map(main.agentCalls.map((a) => [a.toolUseId, a]));
  const subs = fs.readdirSync(subDir).filter((f) => /^agent-.*\.jsonl$/.test(f)).map((f) => {
    const file = path.join(subDir, f);
    const metaFile = file.replace(/\.jsonl$/, '.meta.json');
    const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
    const entries = readJsonl(file);
    const call = byTool.get(meta.toolUseId);
    const text = `${call?.description ?? meta.description ?? ''} ${call?.prompt ?? ''}`;
    const step = text.match(/(\d+)\s*단계/);
    const name = step ? `${step[1]}단계` : short(meta.description ?? f, 24);
    return { entries, name, ts: entries[0]?.timestamp ?? '' };
  }).sort((a, b) => a.ts.localeCompare(b.ts));
  for (const s of subs) segments.push(analyze(s.entries, `하위: ${s.name}`));
}

// ---------- 보고서 ----------
const all = segments.flatMap((s) => s.added);
const totalCalls = segments.reduce((s, x) => s + x.calls.length, 0);
const tot = (k) => segments.reduce((s, x) => s + x[k], 0);
const totalIn = tot('fresh') + tot('write') + tot('read');
const L = [];
const date = (mainEntries.find((o) => o.timestamp)?.timestamp ?? new Date().toISOString()).slice(0, 10);
L.push(`# 토큰 보고서: ${opt.title ?? opt.session}`);
L.push(`세션 ${opt.session} · ${date} · 스크립트 \`.claude/scripts/token-report.mjs\`로 생성`);
L.push('');
L.push('읽는 법: 컨텍스트 = 호출 한 번에 모델이 읽는 입력 전체. 캐시 읽기는 싸고(약 0.1배), 캐시 쓰기는 비싸다(약 1.25배).');
L.push('"누적 비용" = 그 항목의 크기 × 그 뒤에 남은 호출 수. 일찍 들어온 큰 항목일수록 이후 호출마다 다시 읽혀 비싸다.');
L.push('');
L.push('## 총합');
L.push(`- API 호출 ${fmt(totalCalls)}회, 입력 ${fmt(totalIn)} (캐시 읽기 ${fmt(tot('read'))} / 캐시 쓰기 ${fmt(tot('write'))} / 새 입력 ${fmt(tot('fresh'))}), 출력 ${fmt(tot('out'))} (생각 ${fmt(tot('think'))})`);
if (tot('compactions')) L.push(`- 대화 압축(compact) ${tot('compactions')}회 발생`);
L.push('');
L.push('## 구간별');
L.push('| 구간 | 호출 | 시작 ctx | 최대 ctx | 캐시 읽기 | 캐시 쓰기 | 출력 |');
L.push('|---|---:|---:|---:|---:|---:|---:|');
for (const s of segments) L.push(`| ${s.label} | ${s.calls.length} | ${fmt(s.start)} | ${fmt(s.peak)} | ${fmt(s.read)} | ${fmt(s.write)} | ${fmt(s.out)} |`);
L.push('');
L.push('시작 ctx = 첫 호출 입력(시스템 프롬프트·CLAUDE.md·메모리·도구 정의·지시문). 하위 에이전트마다 반복되는 고정 비용이다.');
L.push('');

// 세션(구간)을 열로 두는 표
const segHead = (first) => {
  L.push(`| ${first} | ${segments.map((s) => s.label).join(' | ')} |`);
  L.push(`|---|${segments.map(() => '---:').join('|')}|`);
};

L.push('## 세션별 시작 컨텍스트 구성 (추정)');
const startLabels = [...new Set(segments.flatMap((s) => s.startParts?.rows.map((r) => r.label) ?? []))];
const startOf = (s, label) => s.startParts?.rows.filter((r) => r.label === label).reduce((a, r) => a + r.tokens, 0) ?? 0;
startLabels.sort((a, b) => segments.reduce((t, s) => t + startOf(s, b), 0) - segments.reduce((t, s) => t + startOf(s, a), 0));
segHead('항목');
for (const label of startLabels) L.push(`| ${label} | ${segments.map((s) => fmt(startOf(s, label))).join(' | ')} |`);
L.push(`| **합계 (시작 ctx)** | ${segments.map((s) => fmt(s.start)).join(' | ')} |`);
const bigToolLines = new Map();
for (const s of segments) {
  const big = s.startParts?.bigTools ?? [];
  const line = big.length ? `${s.startParts.toolCount}개 중 ` + big.map((t) => `${t.name} 약 ${fmt(Math.round(t.tokens / 100) * 100)}`).join(' · ') : '';
  if (line) bigToolLines.set(line, [...(bigToolLines.get(line) ?? []), s.label]);
}
for (const [line, labels] of bigToolLines) L.push(`- 큰 도구 정의 (${labels.join(', ')}): ${line}`);
L.push('- 기록에 남은 글자 수 비율로 나눈 값이다. `prompt_snapshot`은 기록 전용 항목이라 아래 분배에서는 뺐다.');
L.push('');

const CATS = ['문서', '코드', '브라우저', '모델 출력', '편집', '빌드·검사', 'git', '알림', '지시', '하위 에이전트 보고', '기타 도구'];
const catOf = (s, cat) => s.added.filter((a) => a.cat === cat).reduce((t, a) => t + a.tokens, 0);
L.push('## 세션별 분류 합계 (시작 이후 늘어난 컨텍스트)');
segHead('분류');
for (const cat of CATS) {
  if (segments.every((s) => catOf(s, cat) < 1)) continue;
  L.push(`| ${cat} | ${segments.map((s) => fmt(catOf(s, cat))).join(' | ')} |`);
}
L.push(`| **합계** | ${segments.map((s) => fmt(s.added.reduce((t, a) => t + a.tokens, 0))).join(' | ')} |`);
L.push(`| **최대 ctx** | ${segments.map((s) => fmt(s.peak)).join(' | ')} |`);
L.push('- 문서 = docs/·.claude/·.md·.html·목업, 코드 = 그 밖의 파일. Bash는 명령에 적힌 경로로 나눈 추정이다. 합계가 (최대 ctx − 시작 ctx)와 다르면 그 차이는 줄어든 구간(압축 등) 때문이다.');
L.push('');

L.push('## 세션별 읽은 문서·코드 (큰 순서 6개, 추가 토큰)');
for (const s of segments) {
  for (const cat of ['문서', '코드']) {
    const g = groupBy(s.added.filter((a) => a.cat === cat), (a) => a.target).sort((a, b) => b.tokens - a.tokens).slice(0, 6);
    if (g.length) L.push(`- ${s.label} ${cat}: ` + g.map((x) => `${short(x.key, 45)} (+${fmt(x.tokens)}${x.count > 1 ? `, ${x.count}회` : ''})`).join(' · '));
  }
}
L.push('');

function groupBy(list, keyFn) {
  const m = new Map();
  for (const a of list) {
    const k = keyFn(a);
    const g = m.get(k) ?? { key: k, count: 0, tokens: 0, cost: 0, labels: new Set() };
    g.count++; g.tokens += a.tokens; g.cost += a.tokens * a.laterCalls; g.labels.add(a.label);
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => b.cost - a.cost);
}

L.push('## 컨텍스트를 늘린 작업 종류 (전 구간 합)');
L.push('| 종류 | 횟수 | 추가된 토큰 | 누적 비용 |');
L.push('|---|---:|---:|---:|');
for (const g of groupBy(all, (a) => a.kind).slice(0, 20)) L.push(`| ${g.key} | ${g.count} | ${fmt(g.tokens)} | ${fmt(g.cost)} |`);
L.push('');

L.push('## 컨텍스트를 가장 많이 늘린 항목 상위 15');
L.push('| 구간 | 종류 | 대상 | 추가 | 누적 비용 |');
L.push('|---|---|---|---:|---:|');
const top = all.filter((a) => a.kind !== '모델 응답(출력)').sort((a, b) => b.tokens - a.tokens).slice(0, 15);
for (const a of top) L.push(`| ${a.label} | ${a.kind} | ${short(a.target, 50).replace(/\|/g, '\\|')} | ${fmt(a.tokens)} | ${fmt(a.tokens * a.laterCalls)} |`);
L.push('');

const reads = groupBy(all.filter((a) => a.kind === 'Read'), (a) => a.target).filter((g) => g.count > 1).sort((a, b) => b.tokens - a.tokens).slice(0, 12);
L.push('## 여러 번 읽은 파일 (중복 읽기 후보)');
if (!reads.length) L.push('- 없음');
else {
  L.push('| 파일 | 횟수 | 합계 | 구간 |');
  L.push('|---|---:|---:|---|');
  for (const g of reads) L.push(`| ${g.key} | ${g.count} | ${fmt(g.tokens)} | ${[...g.labels].join(', ')} |`);
}
L.push('');

L.push('## 구간별 가장 큰 항목 3개');
for (const s of segments.slice(1)) {
  const t3 = s.added.filter((a) => a.kind !== '모델 응답(출력)').sort((a, b) => b.tokens - a.tokens).slice(0, 3);
  L.push(`- ${s.label}: ` + (t3.map((a) => `${a.kind} ${short(a.target, 35)} (+${fmt(a.tokens)})`).join(' · ') || '없음'));
}

const report = L.join('\n') + '\n';
if (opt.out) {
  fs.mkdirSync(path.dirname(opt.out), { recursive: true });
  fs.writeFileSync(opt.out, report, 'utf8');
  console.log(`보고서: ${opt.out}`);
} else {
  process.stdout.write(report);
}
console.log(`호출 ${fmt(totalCalls)}회 · 입력 ${fmt(totalIn)} · 출력 ${fmt(tot('out'))} · 하위 에이전트 ${segments.length - 1}개`);
console.log(`최대 컨텍스트: ${fmt(Math.max(...segments.map((s) => s.peak)))}`);

function fail(msg) { console.error(msg); process.exit(1); }
