// js-process: AI 없이 하는 인젝션 규칙 검사 (job-search R49, ai-rules.md "인젝션 검사" 1번).
// 원문에서 보이지 않는 문자를 지우고, 조작 표시(태그 문자·방향 덮어쓰기·낱말 속 폭 없는 문자)와
// AI에게 하는 지시 꼴 문장을 찾는다. 걸리면 의심 문장(또는 설명)을 돌려준다.

const ZERO_WIDTH = "​‌‍⁠⁡⁢⁣⁤";
const BIDI = "‎‏‪‫‬‭‮⁦⁧⁨⁩";
const BIDI_TAMPER = "‭‮⁦⁧⁨⁩";
const FORMAT = "­  ";
const BOM = "﻿";
const INVISIBLE = new Set([...ZERO_WIDTH, ...BIDI, ...FORMAT, BOM]);

/** 유니코드 태그 문자 (U+E0000–U+E007F): 화면에 안 보이지만 AI는 글자로 읽는다 */
function isTagChar(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return code >= 0xe0000 && code <= 0xe007f;
}

/** AI를 겨냥한 지시 꼴 문장 (읽는 사람에게는 쓸 일이 없는 표현만) */
const INSTRUCTION_PATTERNS: RegExp[] = [
  /\bignore (all|any|the|previous|prior|above|earlier)\b/i,
  /\b(disregard|forget)( all| any| the| your)? (previous|prior|above|earlier|system) (instructions?|prompts?)\b/i,
  /\bsystem prompt\b/i,
  /\byou are (an?|the) (ai|assistant|llm|language model)\b/i,
  /^\s*(assistant|system|user)\s*:/i,
  /<\|/,
  /\[INST\]/i,
  /###\s*(system|instruction)/i,
  /(이전|위의?|앞의?|기존)\s*(모든\s*)?(지시|명령|지침|프롬프트)[^.\n]{0,10}(무시|잊)/,
  /시스템\s*프롬프트/,
  /(AI|인공지능|어시스턴트|챗봇|언어\s*모델|평가\s*모델|채점자|평가자)\s*(에게|님|야|여,)/i,
  /\d{2,3}\s*점[^.\n]{0,15}(주세요|줘|주십시오|부여|매겨|주어야)/,
  /(최고|만)\s*점[^.\n]{0,15}(주세요|줘|주십시오|부여|매겨|주어야)/,
  /(무조건|반드시)\s*(추천|합격|강력\s*추천)/,
];

const MAX_LINE = 200;

export interface GuardResult {
  /** 보이지 않는 문자를 지운 원문 (AI에게는 이것을 보낸다) */
  text: string;
  /** 의심 문장·설명. 비어 있으면 깨끗하다 */
  quotes: string[];
}

export function guardText(raw: string): GuardResult {
  const quotes: string[] = [];
  const chars = [...raw];
  let tags = 0;
  let bidi = 0;
  let splitWords = 0;
  const kept: string[] = [];
  chars.forEach((ch, i) => {
    if (isTagChar(ch)) {
      tags += 1;
      return;
    }
    if (BIDI_TAMPER.includes(ch)) bidi += 1;
    if (ZERO_WIDTH.includes(ch) || ch === BOM) {
      const before = chars[i - 1] ?? "";
      const after = chars[i + 1] ?? "";
      if (/\p{L}/u.test(before) && /\p{L}/u.test(after)) splitWords += 1;
    }
    if (!INVISIBLE.has(ch)) kept.push(ch);
  });
  if (tags > 0) quotes.push(`(숨긴 글: 보이지 않는 유니코드 태그 문자 ${tags}개)`);
  if (bidi > 0) quotes.push(`(숨긴 글: 글 방향을 바꾸는 제어 문자 ${bidi}개)`);
  if (splitWords > 0) quotes.push(`(숨긴 글: 낱말 가운데 낀 폭 없는 문자 ${splitWords}개)`);

  const text = kept.join("");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "" || !INSTRUCTION_PATTERNS.some((p) => p.test(trimmed))) continue;
    const quote = trimmed.length > MAX_LINE ? `${trimmed.slice(0, MAX_LINE)}…` : trimmed;
    if (!quotes.includes(quote)) quotes.push(quote);
  }
  return { text, quotes };
}
