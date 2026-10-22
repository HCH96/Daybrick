/**
 * 단어 뒤에 붙일 "로/으로"를 고른다.
 * 마지막 글자에 받침이 없거나 받침이 ㄹ이면 "로", 그 밖의 받침이면 "으로".
 * 예: 캘린더 → 로, 지원 현황 → 으로
 */
export function withRo(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const isHangul = code >= 0 && code <= 11171;
  const jong = isHangul ? code % 28 : 0; // 받침 번호 (0: 없음, 8: ㄹ)
  return word + (jong === 0 || jong === 8 ? "로" : "으로");
}
