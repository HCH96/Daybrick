// 목업 아이콘 모음. <svg><use href="#i-..."></svg> 로 쓰는 심볼을 페이지에 넣는다.
// AI는 보통 읽지 않는다. 아이콘 모양이 필요하면 id(예: i-home)를 검색한다.
document.write(`
<svg width="0" height="0" style="position:absolute">
  <symbol id="i-side" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></symbol>
  <symbol id="i-back" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6" /></symbol>
  <symbol id="i-fwd" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
  <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></symbol>
  <symbol id="i-timer" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" /><path d="M12 9v4M10 2h4" /></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
  <symbol id="i-bricks" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9.33h18M3 14.67h18M12 4v5.33M7.5 9.33v5.34M16.5 9.33v5.34M12 14.67V20" /></symbol>
  <symbol id="i-wrench" viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6a6 6 0 0 1-7.5 1.2L6 21.3a2 2 0 0 1-2.8-2.8l7.5-7.5A6 6 0 0 1 11.4 3l1.3 1.3a4 4 0 0 0 2 2z" /></symbol>
</svg>
`);
