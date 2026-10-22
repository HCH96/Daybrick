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

// 도구 호출 하나의 종류와 대상
function describeTool(name, input = {}) {
  switch (name) {
    case 'Read': return { kind: 'Read', target: rel(input.file_path) };
    case 'Edit': case 'Write': case 'NotebookEdit': return { kind: name, target: rel(input.file_path ?? input.notebook_path) };
    case 'Grep': return { kind: 'Grep', target: `${input.pattern}${input.path ? ' @ ' + rel(input.path) : ''}` };
    case 'Glob': return { kind: 'Glob', target: input.pattern };
    case 'Agent': case 'Task': return { kind: 'Agent', target: input.description };
    case 'Bash': case 'PowerShell': {
      // 앞의 `cd "경로" &&` 같은 준비 부분은 빼고 실제 명령만 보여 준다
      const c = String(input.command ?? '').replace(/^(\s*(cd\s+("[^"]*"|\S+)|[A-Za-z_$][\w:]*=("[^"]*"|\S+))\s*(&&|;)\s*)+/, '');
      const kind = /npm run build|tsc|cargo (check|build)|tauri build/.test(c) ? 'Bash: 빌드·타입검사'
        : /^\s*git\b/.test(c) ? 'Bash: git' : 'Bash: 기타';
      return { kind, target: short(c, 70) };
    }
    default: return { kind: name, target: short(JSON.stringify(input), 50) };
  }
}

// 한 기록 파일을 API 호출 단위로 분석한다.
// 호출 n의 컨텍스트 = input + cache_creation + cache_read.
// 호출 n → n+1 사이 증가분 = ctx(n+1) - ctx(n). 그중 output(n)은 "모델 응답", 나머지는 그 사이 들어온 항목에 글자 수 비율로 나눈다.
function analyze(entries, label) {
  const calls = []; // { id, usage, items: [] (이 호출 뒤에 들어온 항목) }
  const toolInfo = new Map(); // tool_use_id -> {kind,target}
  const agentCalls = []; // 메인에서 띄운 Agent: { toolUseId, prompt, description }
  let pending = []; // 첫 호출 전에 들어온 항목
  let compactions = 0;
  const seen = new Set();

  for (const o of entries) {
    if (o.type === 'system' && o.subtype === 'compact_boundary') { compactions++; continue; }
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
      if (typeof content === 'string') { sink.push({ kind: '사용자·지시 입력', target: short(content, 50), chars: content.length }); continue; }
      for (const c of content ?? []) {
        if (c.type === 'tool_result') {
          const info = toolInfo.get(c.tool_use_id) ?? { kind: '도구 결과', target: '' };
          sink.push({ ...info, chars: sizeOf(c.content) });
        } else if (c.type === 'text') {
          sink.push({ kind: '사용자·지시 입력', target: short(c.text, 50), chars: c.text.length });
        }
      }
    } else if (o.type === 'attachment' && o.attachment) {
      sink.push({ kind: `알림: ${o.attachment.type}`, target: '', chars: sizeOf(o.attachment) });
    }
  }

  // 증가분 배정
  const added = []; // { kind, target, tokens, laterCalls, label }
  for (let n = 0; n < calls.length - 1; n++) {
    const growth = calls[n + 1].ctx - calls[n].ctx;
    const laterCalls = calls.length - (n + 1);
    const outPart = Math.min(Math.max(growth, 0), calls[n].out);
    if (outPart > 0) added.push({ kind: '모델 응답(출력)', target: '', tokens: outPart, laterCalls, label });
    const rest = growth - outPart;
    const items = calls[n].items;
    const totalChars = items.reduce((s, it) => s + it.chars, 0);
    if (rest > 0 && totalChars > 0) {
      for (const it of items) added.push({ kind: it.kind, target: it.target, tokens: rest * (it.chars / totalChars), laterCalls, label });
    } else if (rest > 0) {
      added.push({ kind: '분배 불가(설명 없는 증가)', target: '', tokens: rest, laterCalls, label });
    }
  }

  const sum = (k) => calls.reduce((s, c) => s + c[k], 0);
  return {
    label, calls, added, agentCalls, compactions,
    start: calls[0]?.ctx ?? 0,
    peak: Math.max(0, ...calls.map((c) => c.ctx)),
    end: calls[calls.length - 1]?.ctx ?? 0,
    fresh: sum('fresh'), write: sum('write'), read: sum('read'), out: sum('out'), think: sum('think'),
  };
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
